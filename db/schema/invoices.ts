import { pgTable, uuid, timestamp, text, numeric, index } from 'drizzle-orm/pg-core';
import { invoiceStatusEnum } from './enums';
import { clinics } from './clinics';
import { patients } from './patients';
import { appointments } from './appointments';

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
    status: invoiceStatusEnum('status').notNull().default('draft'),
    totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').notNull(),
    issuedAt: timestamp('issued_at', { withTimezone: true }).notNull(),
    dueAt: timestamp('due_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    clinicIdx: index('invoices_clinic_idx').on(table.clinicId),
    patientIdx: index('invoices_patient_idx').on(table.patientId),
  }),
);

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
