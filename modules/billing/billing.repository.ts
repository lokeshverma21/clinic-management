// modules/billing/billing.repository.ts
import { and, eq, ilike, inArray, isNull, or, sql, desc, asc, gte, lte, like } from 'drizzle-orm';
import { db } from '@/db/client';
import { invoices, invoiceItems, patients, memberships, users, auditLogs } from '@/db/schema';
import type { Invoice, InvoiceItem, NewInvoice, NewInvoiceItem } from '@/db/schema';
import type { ListInvoicesFilters, InvoiceWithDetails, InvoiceStats } from './billing.types';

/** The Drizzle transaction type — avoids `any` on the `tx` parameter. */
type DbClient = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function generateInvoiceNumber(clinicId: string, tx: DbClient = db): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;

  const [lastInvoice] = await tx
    .select({ invoiceNumber: invoices.invoiceNumber })
    .from(invoices)
    .where(and(eq(invoices.clinicId, clinicId), like(invoices.invoiceNumber, `${prefix}%`)))
    .orderBy(desc(invoices.invoiceNumber))
    .limit(1);

  if (lastInvoice) {
    const lastNumStr = lastInvoice.invoiceNumber.substring(prefix.length);
    const nextNum = parseInt(lastNumStr, 10) + 1;
    const nextNumStr = String(nextNum).padStart(6, '0');
    return `${prefix}${nextNumStr}`;
  }

  return `${prefix}000001`;
}

export async function listInvoices(
  clinicId: string,
  filters: ListInvoicesFilters,
): Promise<{ rows: InvoiceWithDetails[]; total: number }> {
  const conditions = [eq(invoices.clinicId, clinicId), isNull(invoices.deletedAt)];

  if (filters.patientId) {
    conditions.push(eq(invoices.patientId, filters.patientId));
  }
  if (filters.doctorMembershipId) {
    conditions.push(eq(invoices.doctorMembershipId, filters.doctorMembershipId));
  }
  if (filters.status) {
    conditions.push(eq(invoices.status, filters.status));
  }
  if (filters.paymentMethod) {
    conditions.push(eq(invoices.paymentMethod, filters.paymentMethod));
  }
  if (filters.from) {
    const fromDate = new Date(`${filters.from}T00:00:00.000Z`);
    conditions.push(gte(invoices.issuedAt, fromDate));
  }
  if (filters.to) {
    const toDate = new Date(`${filters.to}T23:59:59.999Z`);
    conditions.push(lte(invoices.issuedAt, toDate));
  }

  // Search across invoice number, patient name, patient phone, or doctor name
  if (filters.search) {
    const term = `%${filters.search}%`;
    const searchCondition = or(
      ilike(invoices.invoiceNumber, term),
      ilike(patients.fullName, term),
      ilike(patients.phone, term),
      ilike(users.fullName, term),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const where = and(...conditions);
  const offset = (filters.page - 1) * filters.pageSize;

  // Resolve order column by name to avoid union type mismatch
  const order =
    filters.sortBy === 'totalAmount'
      ? filters.sortOrder === 'asc'
        ? asc(invoices.totalAmount)
        : desc(invoices.totalAmount)
      : filters.sortBy === 'createdAt'
        ? filters.sortOrder === 'asc'
          ? asc(invoices.createdAt)
          : desc(invoices.createdAt)
        : filters.sortOrder === 'asc'
          ? asc(invoices.issuedAt)
          : desc(invoices.issuedAt);

  // 1. Fetch Invoices with patient & doctor joins
  const rawRows = await db
    .select({
      invoice: invoices,
      patient: {
        id: patients.id,
        fullName: patients.fullName,
        phone: patients.phone,
        email: patients.email,
      },
      doctor: {
        membershipId: memberships.id,
        fullName: users.fullName,
        email: users.email,
      },
    })
    .from(invoices)
    .innerJoin(patients, eq(invoices.patientId, patients.id))
    .leftJoin(memberships, eq(invoices.doctorMembershipId, memberships.id))
    .leftJoin(users, eq(memberships.userId, users.id))
    .where(where)
    .limit(filters.pageSize)
    .offset(offset)
    .orderBy(order);

  // Total Count Query
  const [totalCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .innerJoin(patients, eq(invoices.patientId, patients.id))
    .leftJoin(memberships, eq(invoices.doctorMembershipId, memberships.id))
    .leftJoin(users, eq(memberships.userId, users.id))
    .where(where);

  const total = totalCountRow?.count ?? 0;

  // 2. Fetch associated invoice items for the retrieved rows using a single query
  const invoiceIds = rawRows.map((r) => r.invoice.id);
  const items = invoiceIds.length > 0
    ? await db.select().from(invoiceItems).where(inArray(invoiceItems.invoiceId, invoiceIds))
    : [];

  // 3. Map details together
  const rows: InvoiceWithDetails[] = rawRows.map((row) => {
    const rowItems = items.filter((item) => item.invoiceId === row.invoice.id);
    return {
      ...row.invoice,
      patient: row.patient,
      doctor: row.doctor.membershipId
        ? {
            membershipId: row.doctor.membershipId,
            fullName: row.doctor.fullName ?? '',
            email: row.doctor.email ?? '',
          }
        : null,
      items: rowItems,
    };
  });

  return { rows, total };
}

export async function getInvoiceById(clinicId: string, invoiceId: string): Promise<InvoiceWithDetails | null> {
  const [row] = await db
    .select({
      invoice: invoices,
      patient: {
        id: patients.id,
        fullName: patients.fullName,
        phone: patients.phone,
        email: patients.email,
      },
      doctor: {
        membershipId: memberships.id,
        fullName: users.fullName,
        email: users.email,
      },
    })
    .from(invoices)
    .innerJoin(patients, eq(invoices.patientId, patients.id))
    .leftJoin(memberships, eq(invoices.doctorMembershipId, memberships.id))
    .leftJoin(users, eq(memberships.userId, users.id))
    .where(and(eq(invoices.clinicId, clinicId), eq(invoices.id, invoiceId), isNull(invoices.deletedAt)))
    .limit(1);

  if (!row) return null;

  const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));

  return {
    ...row.invoice,
    patient: row.patient,
    doctor: row.doctor.membershipId
      ? {
          membershipId: row.doctor.membershipId,
          fullName: row.doctor.fullName ?? '',
          email: row.doctor.email ?? '',
        }
      : null,
    items,
  };
}

export async function insertInvoice(
  clinicId: string,
  invoiceInput: Omit<NewInvoice, 'clinicId' | 'invoiceNumber'>,
  itemsInput: Omit<NewInvoiceItem, 'invoiceId'>[],
): Promise<InvoiceWithDetails> {
  return db.transaction(async (tx) => {
    const invoiceNumber = await generateInvoiceNumber(clinicId, tx);

    const [invoice] = await tx
      .insert(invoices)
      .values({
        ...invoiceInput,
        clinicId,
        invoiceNumber,
      })
      .returning();

    // Map and insert line items
    let insertedItems: InvoiceItem[] = [];
    if (itemsInput.length > 0) {
      insertedItems = await tx
        .insert(invoiceItems)
        .values(itemsInput.map((item) => ({ ...item, invoiceId: invoice.id })))
        .returning();
    }

    // Grab patient and doctor information inside the transaction
    const [patient] = await tx
      .select({ id: patients.id, fullName: patients.fullName, phone: patients.phone, email: patients.email })
      .from(patients)
      .where(eq(patients.id, invoice.patientId))
      .limit(1);

    let doctor: InvoiceWithDetails['doctor'] = null;
    if (invoice.doctorMembershipId) {
      const [doctorInfo] = await tx
        .select({ membershipId: memberships.id, fullName: users.fullName, email: users.email })
        .from(memberships)
        .innerJoin(users, eq(memberships.userId, users.id))
        .where(eq(memberships.id, invoice.doctorMembershipId))
        .limit(1);
      if (doctorInfo) {
        doctor = {
          membershipId: doctorInfo.membershipId,
          fullName: doctorInfo.fullName ?? '',
          email: doctorInfo.email ?? '',
        };
      }
    }

    return {
      ...invoice,
      patient,
      doctor,
      items: insertedItems,
    };
  });
}

export async function updateInvoice(
  clinicId: string,
  invoiceId: string,
  invoicePatch: Partial<Omit<NewInvoice, 'clinicId' | 'invoiceNumber'>>,
  itemsInput?: Omit<NewInvoiceItem, 'invoiceId'>[],
): Promise<InvoiceWithDetails | null> {
  return db.transaction(async (tx) => {
    // 1. Update the Invoice Header records
    const [invoice] = await tx
      .update(invoices)
      .set({ ...invoicePatch, updatedAt: new Date() })
      .where(and(eq(invoices.clinicId, clinicId), eq(invoices.id, invoiceId), isNull(invoices.deletedAt)))
      .returning();

    if (!invoice) return null;

    // 2. If line items patches are provided, delete and recreate them
    if (itemsInput) {
      await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
      if (itemsInput.length > 0) {
        await tx
          .insert(invoiceItems)
          .values(itemsInput.map((item) => ({ ...item, invoiceId })))
          .returning();
      }
    }

    // 3. Fetch full details for the returned invoice
    const [patient] = await tx
      .select({ id: patients.id, fullName: patients.fullName, phone: patients.phone, email: patients.email })
      .from(patients)
      .where(eq(patients.id, invoice.patientId))
      .limit(1);

    let doctor: InvoiceWithDetails['doctor'] = null;
    if (invoice.doctorMembershipId) {
      const [doctorInfo] = await tx
        .select({ membershipId: memberships.id, fullName: users.fullName, email: users.email })
        .from(memberships)
        .innerJoin(users, eq(memberships.userId, users.id))
        .where(eq(memberships.id, invoice.doctorMembershipId))
        .limit(1);
      if (doctorInfo) {
        doctor = {
          membershipId: doctorInfo.membershipId,
          fullName: doctorInfo.fullName ?? '',
          email: doctorInfo.email ?? '',
        };
      }
    }

    const currentItems = await tx.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));

    return {
      ...invoice,
      patient,
      doctor,
      items: currentItems,
    };
  });
}

export async function softDeleteInvoice(clinicId: string, invoiceId: string): Promise<Invoice | null> {
  const [invoice] = await db
    .update(invoices)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(invoices.clinicId, clinicId), eq(invoices.id, invoiceId), isNull(invoices.deletedAt)))
    .returning();
  return invoice ?? null;
}

export async function getBillingSummaryStats(clinicId: string): Promise<InvoiceStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Total revenue (sum of amount_paid of all non-deleted invoices)
  const [revRow] = await db
    .select({ val: sql<string>`coalesce(sum(amount_paid), 0)` })
    .from(invoices)
    .where(and(eq(invoices.clinicId, clinicId), isNull(invoices.deletedAt)));

  // 2. Outstanding Balance (sum of balance_due of unpaid/partially_paid/overdue invoices)
  const [outstandingRow] = await db
    .select({ val: sql<string>`coalesce(sum(balance_due), 0)` })
    .from(invoices)
    .where(
      and(
        eq(invoices.clinicId, clinicId),
        isNull(invoices.deletedAt),
        inArray(invoices.status, ['unpaid', 'partially_paid', 'overdue']),
      ),
    );

  // 3. This month's invoice count
  const [thisMonthRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .where(and(eq(invoices.clinicId, clinicId), isNull(invoices.deletedAt), gte(invoices.issuedAt, startOfMonth)));

  // 4. Average invoice value (excludes cancelled/void/refunded invoices)
  const [avgValRow] = await db
    .select({ val: sql<string>`coalesce(avg(total_amount), 0)` })
    .from(invoices)
    .where(
      and(
        eq(invoices.clinicId, clinicId),
        isNull(invoices.deletedAt),
        inArray(invoices.status, ['draft', 'unpaid', 'partially_paid', 'paid', 'overdue']),
      ),
    );

  // 5. Counts grouped by status
  const counts = await db
    .select({
      status: invoices.status,
      count: sql<number>`count(*)::int`,
    })
    .from(invoices)
    .where(and(eq(invoices.clinicId, clinicId), isNull(invoices.deletedAt)))
    .groupBy(invoices.status);

  let paidCount = 0;
  let unpaidCount = 0;
  let partiallyPaidCount = 0;
  let cancelledCount = 0;

  counts.forEach((c) => {
    if (c.status === 'paid') paidCount = c.count;
    if (c.status === 'unpaid') unpaidCount = c.count;
    if (c.status === 'partially_paid') partiallyPaidCount = c.count;
    if (c.status === 'cancelled') cancelledCount = c.count;
  });

  return {
    totalRevenue: parseFloat(revRow?.val ?? '0'),
    outstandingPayments: parseFloat(outstandingRow?.val ?? '0'),
    invoicesGeneratedThisMonth: thisMonthRow?.count ?? 0,
    averageInvoiceValue: parseFloat(avgValRow?.val ?? '0'),
    paidCount,
    unpaidCount,
    partiallyPaidCount,
    cancelledCount,
  };
}

export async function insertAuditLog(input: {
  clinicId: string;
  actorMembershipId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await db.insert(auditLogs).values({
    clinicId: input.clinicId,
    actorMembershipId: input.actorMembershipId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    metadata: input.metadata ?? null,
  });
}
