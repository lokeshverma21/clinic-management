import { pgTable, uuid, text, date, timestamp, index } from 'drizzle-orm/pg-core';
import { genderEnum } from './enums';
import { clinics } from './clinics';

/**
 * A patient record is clinic-owned, not a global identity — the same
 * real-world person at two clinics gets two separate rows (Part 6's edge
 * case note). Soft-deleted via deleted_at (Part 6/22 Decision #12).
 */
export const patients = pgTable(
  'patients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id, { onDelete: 'cascade' }),
    fullName: text('full_name').notNull(),
    phone: text('phone').notNull(),
    email: text('email'),
    dateOfBirth: date('date_of_birth'),
    gender: genderEnum('gender'),
    notes: text('notes'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    clinicIdx: index('patients_clinic_idx').on(table.clinicId),
    // Fast duplicate-check on entry
    clinicPhoneIdx: index('patients_clinic_phone_idx').on(table.clinicId, table.phone),
  }),
);

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
