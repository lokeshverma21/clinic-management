// modules/billing/billing.validation.ts
import { z } from 'zod';

const invoiceStatusSchema = z.enum([
  'draft',
  'unpaid',
  'partially_paid',
  'paid',
  'cancelled',
  'refunded',
  'overdue',
  'void',
]);

export const invoiceItemInputSchema = z.object({
  description: z.string().trim().min(1, 'Description is required').max(500),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  discount: z.number().min(0, 'Discount must be positive').default(0),
  tax: z.number().min(0, 'Tax must be positive').default(0),
});

export const createInvoiceSchema = z.object({
  patientId: z.string().uuid('Invalid Patient ID'),
  doctorMembershipId: z.string().uuid('Invalid Doctor ID').nullable().optional(),
  appointmentId: z.string().uuid('Invalid Appointment ID').nullable().optional(),
  issuedAt: z.string().datetime({ offset: true }).optional(),
  dueAt: z.string().datetime({ offset: true }).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  paymentMethod: z.string().trim().max(100).nullable().optional(),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  amountPaid: z.number().min(0).default(0),
  items: z.array(invoiceItemInputSchema).min(1, 'Invoice must contain at least one line item'),
});

export const updateInvoiceSchema = z.object({
  patientId: z.string().uuid('Invalid Patient ID').optional(),
  doctorMembershipId: z.string().uuid('Invalid Doctor ID').nullable().optional(),
  appointmentId: z.string().uuid('Invalid Appointment ID').nullable().optional(),
  issuedAt: z.string().datetime({ offset: true }).optional(),
  dueAt: z.string().datetime({ offset: true }).nullable().optional(),
  status: invoiceStatusSchema.optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  paymentMethod: z.string().trim().max(100).nullable().optional(),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  amountPaid: z.number().min(0).optional(),
  items: z.array(invoiceItemInputSchema).min(1).optional(),
});

export const addPaymentSchema = z.object({
  amountPaid: z.number().gt(0, 'Payment amount must be greater than 0'),
  paymentMethod: z.string().trim().min(1, 'Payment method is required').max(100),
});

export const listInvoicesQuerySchema = z.object({
  search: z.string().trim().optional(),
  patientId: z.string().uuid().optional(),
  doctorMembershipId: z.string().uuid().optional(),
  status: invoiceStatusSchema.optional(),
  paymentMethod: z.string().trim().optional(),
  from: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional(),
  to: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['issuedAt', 'totalAmount', 'createdAt']).default('issuedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateInvoiceInputSchema = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInputSchema = z.infer<typeof updateInvoiceSchema>;
export type AddPaymentSchema = z.infer<typeof addPaymentSchema>;
export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
