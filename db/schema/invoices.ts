import { pgTable, uuid, timestamp, text, numeric, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { invoiceStatusEnum } from './enums';
import { clinics } from './clinics';
import { patients } from './patients';
import { appointments } from './appointments';
import { memberships } from './memberships';

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id, { onDelete: 'cascade' }),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'restrict' }),
    appointmentId: uuid('appointment_id').references(() => appointments.id, {
      onDelete: 'set null',
    }),
    doctorMembershipId: uuid('doctor_membership_id').references(() => memberships.id, {
      onDelete: 'set null',
    }),
    invoiceNumber: text('invoice_number').notNull(),
    status: invoiceStatusEnum('status').notNull().default('draft'),
    subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull().default('0.00'),
    discount: numeric('discount', { precision: 10, scale: 2 }).notNull().default('0.00'),
    tax: numeric('tax', { precision: 10, scale: 2 }).notNull().default('0.00'),
    totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull().default('0.00'), // Grand Total
    amountPaid: numeric('amount_paid', { precision: 10, scale: 2 }).notNull().default('0.00'),
    balanceDue: numeric('balance_due', { precision: 10, scale: 2 }).notNull().default('0.00'),
    currency: text('currency').notNull().default('USD'),
    paymentMethod: text('payment_method'),
    notes: text('notes'),
    issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
    dueAt: timestamp('due_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    clinicIdx: index('invoices_clinic_idx').on(table.clinicId),
    patientIdx: index('invoices_patient_idx').on(table.patientId),
    clinicInvoiceNumberUnique: uniqueIndex('invoices_clinic_invoice_number_unique').on(
      table.clinicId,
      table.invoiceNumber,
    ),
  }),
);

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

