import { pgTable, uuid, timestamp, text, index } from 'drizzle-orm/pg-core';
import { appointmentStatusEnum } from './enums';
import { clinics } from './clinics';
import { patients } from './patients';
import { memberships } from './memberships';

export const appointments = pgTable(
  'appointments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id, { onDelete: 'cascade' }),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'restrict' }),
    doctorMembershipId: uuid('doctor_membership_id')
      .notNull()
      .references(() => memberships.id, { onDelete: 'restrict' }),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }).notNull(),
    status: appointmentStatusEnum('status').notNull().default('booked'),
    notes: text('notes'),
    createdByMembershipId: uuid('created_by_membership_id')
      .notNull()
      .references(() => memberships.id, { onDelete: 'restrict' }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // The single most performance-critical index in the system (Part 6) —
    // nearly every dashboard/calendar query filters on this combination.
    clinicStartIdx: index('appointments_clinic_start_idx').on(table.clinicId, table.startTime),
    patientIdx: index('appointments_patient_idx').on(table.patientId),
  }),
);

/**
 * Part 6 requires a database-level EXCLUDE constraint so double-booking is
 * structurally impossible, not just application-checked. Drizzle's schema
 * builder can't express EXCLUDE, so add this by hand to the generated
 * migration file, right after the appointments CREATE TABLE statement:
 *
 *   CREATE EXTENSION IF NOT EXISTS btree_gist;
 *
 *   ALTER TABLE appointments
 *     ADD CONSTRAINT no_overlapping_appointments
 *     EXCLUDE USING gist (
 *       doctor_membership_id WITH =,
 *       tstzrange(start_time, end_time) WITH &&
 *     )
 *     WHERE (status <> 'canceled');
 */

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
