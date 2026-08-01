// modules/billing/billing.service.ts
import { BadRequestError, ForbiddenError, NotFoundError } from '@/lib/errors/app-error';
import type { RequestContext } from '@/lib/auth/request-context';
import { getPatient } from '@/modules/patients';
import { getMembershipInClinic } from '@/modules/staff/staff.repository';
import * as billingRepository from './billing.repository';
import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  ListInvoicesFilters,
  ListInvoicesResult,
  InvoiceWithDetails,
  InvoiceStats,
  Invoice,
  InvoiceStatusType,
} from './billing.types';
import type { NewInvoice, NewInvoiceItem } from '@/db/schema';

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Access Control Gates:
 * - Doctors: View-only access. Cannot execute mutations.
 * - Receptionists: Can create and update draft invoices, register payments, print, duplicate.
 * - Owners: Full control, including soft-deleting invoices.
 */

function assertCanWrite(ctx: RequestContext) {
  if (ctx.role === 'doctor') {
    throw new ForbiddenError('WRITE_FORBIDDEN', 'Doctors are not authorized to create or modify invoices');
  }
}

function assertCanDelete(ctx: RequestContext) {
  if (ctx.role !== 'owner') {
    throw new ForbiddenError('DELETE_FORBIDDEN', 'Only the clinic owner can delete invoices');
  }
}

/** Compute the initial status from amountPaid vs grandTotal. */
function deriveStatus(amountPaid: number, grandTotal: number): InvoiceStatusType {
  if (amountPaid <= 0) return 'unpaid';
  const balance = round(grandTotal - amountPaid);
  return balance <= 0 ? 'paid' : 'partially_paid';
}

export async function listInvoices(
  ctx: RequestContext,
  filters: ListInvoicesFilters,
): Promise<ListInvoicesResult> {
  const result = await billingRepository.listInvoices(ctx.clinicId, filters);
  return {
    invoices: result.rows,
    total: result.total,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function getInvoice(ctx: RequestContext, invoiceId: string): Promise<InvoiceWithDetails> {
  const invoice = await billingRepository.getInvoiceById(ctx.clinicId, invoiceId);
  if (!invoice) {
    throw new NotFoundError('INVOICE_NOT_FOUND', 'Invoice not found');
  }
  return invoice;
}

export async function createInvoice(
  ctx: RequestContext,
  input: CreateInvoiceInput,
): Promise<InvoiceWithDetails> {
  assertCanWrite(ctx);

  // 1. Verify Patient belongs to the clinic (throws NotFoundError if not)
  await getPatient(ctx, input.patientId);

  // 2. Verify Doctor if provided
  if (input.doctorMembershipId) {
    const doctorMem = await getMembershipInClinic(ctx.clinicId, input.doctorMembershipId);
    if (!doctorMem) {
      throw new NotFoundError('DOCTOR_NOT_FOUND', 'Selected doctor was not found in this clinic');
    }
  }

  // 3. Perform server-side monetary calculations
  let subtotal = 0;
  let totalItemDiscounts = 0;
  let totalItemTaxes = 0;

  const itemsPayload: Omit<NewInvoiceItem, 'invoiceId'>[] = input.items.map((item) => {
    const qty = item.quantity;
    const price = item.unitPrice;
    const discount = item.discount ?? 0;
    const tax = item.tax ?? 0;

    const totalPrice = round(qty * price - discount + tax);

    subtotal += round(qty * price);
    totalItemDiscounts += discount;
    totalItemTaxes += tax;

    return {
      description: item.description,
      quantity: qty,
      unitPrice: price.toFixed(2),
      discount: discount.toFixed(2),
      tax: tax.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
    };
  });

  const invoiceSubtotal = round(subtotal);
  const invoiceLevelDiscount = input.discount ?? 0;
  const invoiceLevelTax = input.tax ?? 0;

  const grandTotal = round(
    invoiceSubtotal - (totalItemDiscounts + invoiceLevelDiscount) + (totalItemTaxes + invoiceLevelTax),
  );

  const amountPaid = input.amountPaid ?? 0;
  const balanceDue = round(grandTotal - amountPaid);
  const initialStatus = deriveStatus(amountPaid, grandTotal);

  const invoiceInput: Omit<NewInvoice, 'clinicId' | 'invoiceNumber'> = {
    patientId: input.patientId,
    doctorMembershipId: input.doctorMembershipId ?? null,
    appointmentId: input.appointmentId ?? null,
    status: initialStatus,
    subtotal: invoiceSubtotal.toFixed(2),
    discount: invoiceLevelDiscount.toFixed(2),
    tax: invoiceLevelTax.toFixed(2),
    totalAmount: grandTotal.toFixed(2),
    amountPaid: amountPaid.toFixed(2),
    balanceDue: balanceDue.toFixed(2),
    currency: 'INR',
    paymentMethod: input.paymentMethod ?? null,
    notes: input.notes ?? null,
    issuedAt: input.issuedAt ? new Date(input.issuedAt) : undefined,
    dueAt: input.dueAt ? new Date(input.dueAt) : null,
  };

  const invoice = await billingRepository.insertInvoice(ctx.clinicId, invoiceInput, itemsPayload);

  // 4. Create Audit Log
  await billingRepository.insertAuditLog({
    clinicId: ctx.clinicId,
    actorMembershipId: ctx.membershipId,
    action: 'invoice.created',
    targetType: 'invoice',
    targetId: invoice.id,
    metadata: { invoiceNumber: invoice.invoiceNumber, totalAmount: invoice.totalAmount },
  });

  return invoice;
}

export async function updateInvoice(
  ctx: RequestContext,
  invoiceId: string,
  input: UpdateInvoiceInput,
): Promise<InvoiceWithDetails> {
  assertCanWrite(ctx);

  const existing = await billingRepository.getInvoiceById(ctx.clinicId, invoiceId);
  if (!existing) {
    throw new NotFoundError('INVOICE_NOT_FOUND', 'Invoice not found');
  }

  // Finalized Invoices: Block edit except for payments, notes, and specific status transitions
  const isFinalized = existing.status !== 'draft';

  if (isFinalized) {
    // Audit Lock: Block any changes to structural items, patient, doctor, appointment, or amounts
    const hasStructureChanges =
      input.patientId !== undefined ||
      input.items !== undefined ||
      input.discount !== undefined ||
      input.tax !== undefined ||
      input.doctorMembershipId !== undefined ||
      input.appointmentId !== undefined ||
      (input.amountPaid !== undefined && round(input.amountPaid) !== round(parseFloat(existing.amountPaid)));

    if (hasStructureChanges) {
      throw new BadRequestError(
        'FINALIZED_INVOICE_LOCKED',
        'Cannot edit structural details or history amounts of an already issued or paid invoice.',
      );
    }
  }

  // 1. Resolve Patient if changing
  if (input.patientId) {
    await getPatient(ctx, input.patientId);
  }

  // 2. Resolve Doctor if changing
  if (input.doctorMembershipId) {
    const doctorMem = await getMembershipInClinic(ctx.clinicId, input.doctorMembershipId);
    if (!doctorMem) {
      throw new NotFoundError('DOCTOR_NOT_FOUND', 'Selected doctor was not found in this clinic');
    }
  }

  // 3. Build the invoice patch with proper typing
  const invoicePatch: Partial<Omit<NewInvoice, 'clinicId' | 'invoiceNumber'>> = {};

  if (input.notes !== undefined) invoicePatch.notes = input.notes;
  if (input.paymentMethod !== undefined) invoicePatch.paymentMethod = input.paymentMethod;
  if (input.dueAt !== undefined) invoicePatch.dueAt = input.dueAt ? new Date(input.dueAt) : null;
  if (input.issuedAt !== undefined) invoicePatch.issuedAt = new Date(input.issuedAt);
  if (input.status !== undefined) invoicePatch.status = input.status;
  if (input.doctorMembershipId !== undefined) invoicePatch.doctorMembershipId = input.doctorMembershipId;
  if (input.appointmentId !== undefined) invoicePatch.appointmentId = input.appointmentId;
  if (input.patientId !== undefined) invoicePatch.patientId = input.patientId;

  let itemsPayload: Omit<NewInvoiceItem, 'invoiceId'>[] | undefined = undefined;

  if (!isFinalized) {
    // Re-map existing items (InvoiceItem) vs new items (InvoiceItemInput) to a common shape
    const rawItems = input.items ?? existing.items;
    const discount = input.discount ?? parseFloat(existing.discount);
    const tax = input.tax ?? parseFloat(existing.tax);
    const amountPaid = input.amountPaid ?? parseFloat(existing.amountPaid);

    let itemSubtotal = 0;
    let totalItemDiscounts = 0;
    let totalItemTaxes = 0;

    itemsPayload = rawItems.map((item) => {
      const qty = item.quantity;
      // unitPrice may be string (from DB InvoiceItem) or number (from InvoiceItemInput)
      const price = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice;
      const itemDiscount =
        item.discount === undefined || item.discount === null
          ? 0
          : typeof item.discount === 'string'
            ? parseFloat(item.discount)
            : item.discount;
      const itemTax =
        item.tax === undefined || item.tax === null
          ? 0
          : typeof item.tax === 'string'
            ? parseFloat(item.tax)
            : item.tax;

      const totalPrice = round(qty * price - itemDiscount + itemTax);

      itemSubtotal += round(qty * price);
      totalItemDiscounts += itemDiscount;
      totalItemTaxes += itemTax;

      return {
        description: item.description,
        quantity: qty,
        unitPrice: price.toFixed(2),
        discount: itemDiscount.toFixed(2),
        tax: itemTax.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
      };
    });

    const invoiceSubtotal = round(itemSubtotal);
    const grandTotal = round(invoiceSubtotal - (totalItemDiscounts + discount) + (totalItemTaxes + tax));
    const balanceDue = round(grandTotal - amountPaid);

    invoicePatch.subtotal = invoiceSubtotal.toFixed(2);
    invoicePatch.discount = discount.toFixed(2);
    invoicePatch.tax = tax.toFixed(2);
    invoicePatch.totalAmount = grandTotal.toFixed(2);
    invoicePatch.amountPaid = amountPaid.toFixed(2);
    invoicePatch.balanceDue = balanceDue.toFixed(2);

    // Only auto-derive status if not explicitly set by caller
    if (input.status === undefined) {
      invoicePatch.status = deriveStatus(amountPaid, grandTotal);
    }
  }

  const updated = await billingRepository.updateInvoice(ctx.clinicId, invoiceId, invoicePatch, itemsPayload);
  if (!updated) {
    throw new NotFoundError('INVOICE_NOT_FOUND', 'Invoice not found');
  }

  // Audit log
  await billingRepository.insertAuditLog({
    clinicId: ctx.clinicId,
    actorMembershipId: ctx.membershipId,
    action: 'invoice.updated',
    targetType: 'invoice',
    targetId: invoiceId,
    metadata: { invoiceNumber: updated.invoiceNumber, status: updated.status },
  });

  return updated;
}

export async function addInvoicePayment(
  ctx: RequestContext,
  invoiceId: string,
  paymentAmount: number,
  paymentMethod: string,
): Promise<InvoiceWithDetails> {
  assertCanWrite(ctx);

  const existing = await billingRepository.getInvoiceById(ctx.clinicId, invoiceId);
  if (!existing) {
    throw new NotFoundError('INVOICE_NOT_FOUND', 'Invoice not found');
  }

  if (existing.status === 'draft') {
    throw new BadRequestError('DRAFT_PAYMENT', 'Cannot record payment on a draft invoice.');
  }

  if (existing.status === 'cancelled' || existing.status === 'void' || existing.status === 'refunded') {
    throw new BadRequestError('BAD_INVOICE_STATE', `Cannot collect payment on a ${existing.status} invoice.`);
  }

  const currentPaid = parseFloat(existing.amountPaid);
  const totalAmount = parseFloat(existing.totalAmount);

  const nextPaid = round(currentPaid + paymentAmount);
  const nextBalance = round(totalAmount - nextPaid);
  const nextStatus: InvoiceStatusType = nextPaid >= totalAmount ? 'paid' : 'partially_paid';

  const patch: Partial<Omit<NewInvoice, 'clinicId' | 'invoiceNumber'>> = {
    amountPaid: nextPaid.toFixed(2),
    balanceDue: nextBalance.toFixed(2),
    status: nextStatus,
    paymentMethod,
  };

  const updated = await billingRepository.updateInvoice(ctx.clinicId, invoiceId, patch);

  if (!updated) {
    throw new NotFoundError('INVOICE_NOT_FOUND', 'Invoice not found');
  }

  // Audit log
  await billingRepository.insertAuditLog({
    clinicId: ctx.clinicId,
    actorMembershipId: ctx.membershipId,
    action: 'invoice.payment_recorded',
    targetType: 'invoice',
    targetId: invoiceId,
    metadata: {
      invoiceNumber: updated.invoiceNumber,
      amountRecorded: paymentAmount,
      totalAmountPaid: updated.amountPaid,
      paymentMethod,
    },
  });

  return updated;
}

export async function duplicateDraftInvoice(
  ctx: RequestContext,
  invoiceId: string,
): Promise<InvoiceWithDetails> {
  assertCanWrite(ctx);

  const existing = await billingRepository.getInvoiceById(ctx.clinicId, invoiceId);
  if (!existing) {
    throw new NotFoundError('INVOICE_NOT_FOUND', 'Source invoice not found');
  }

  // Prepare duplicate as draft with zero payment
  const invoiceInput: Omit<NewInvoice, 'clinicId' | 'invoiceNumber'> = {
    patientId: existing.patientId,
    doctorMembershipId: existing.doctorMembershipId,
    appointmentId: existing.appointmentId,
    status: 'draft',
    subtotal: existing.subtotal,
    discount: existing.discount,
    tax: existing.tax,
    totalAmount: existing.totalAmount,
    amountPaid: '0.00',
    balanceDue: existing.totalAmount,
    currency: 'INR',
    paymentMethod: null,
    notes: existing.notes
      ? `Duplicate of ${existing.invoiceNumber}. ${existing.notes}`
      : `Duplicate of ${existing.invoiceNumber}`,
    dueAt: existing.dueAt ? new Date(existing.dueAt) : null,
  };

  const itemsInput: Omit<NewInvoiceItem, 'invoiceId'>[] = existing.items.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discount: item.discount,
    tax: item.tax,
    totalPrice: item.totalPrice,
  }));

  const invoice = await billingRepository.insertInvoice(ctx.clinicId, invoiceInput, itemsInput);

  // Audit log
  await billingRepository.insertAuditLog({
    clinicId: ctx.clinicId,
    actorMembershipId: ctx.membershipId,
    action: 'invoice.duplicated',
    targetType: 'invoice',
    targetId: invoice.id,
    metadata: { sourceInvoice: existing.invoiceNumber, newInvoice: invoice.invoiceNumber },
  });

  return invoice;
}

export async function deleteInvoice(ctx: RequestContext, invoiceId: string): Promise<Invoice> {
  assertCanDelete(ctx);

  const existing = await billingRepository.getInvoiceById(ctx.clinicId, invoiceId);
  if (!existing) {
    throw new NotFoundError('INVOICE_NOT_FOUND', 'Invoice not found');
  }

  // Soft delete invoice in database
  const deleted = await billingRepository.softDeleteInvoice(ctx.clinicId, invoiceId);
  if (!deleted) {
    throw new NotFoundError('INVOICE_NOT_FOUND', 'Invoice not found');
  }

  // Audit log
  await billingRepository.insertAuditLog({
    clinicId: ctx.clinicId,
    actorMembershipId: ctx.membershipId,
    action: 'invoice.deleted',
    targetType: 'invoice',
    targetId: invoiceId,
    metadata: { invoiceNumber: deleted.invoiceNumber },
  });

  return deleted;
}

export async function getBillingStats(ctx: RequestContext): Promise<InvoiceStats> {
  return billingRepository.getBillingSummaryStats(ctx.clinicId);
}
