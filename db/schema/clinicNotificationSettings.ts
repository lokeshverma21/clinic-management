import { pgTable, uuid, boolean, timestamp } from 'drizzle-orm/pg-core';
import { clinics } from './clinics';

/**
 * Clinic-scoped notification preferences owned by the Notifications module.
 * One row per clinic; created on first read with defaults.
 */
export const clinicNotificationSettings = pgTable('clinic_notification_settings', {
  clinicId: uuid('clinic_id')
    .primaryKey()
    .references(() => clinics.id, { onDelete: 'cascade' }),
  autoEmailRemindersEnabled: boolean('auto_email_reminders_enabled').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type ClinicNotificationSettings = typeof clinicNotificationSettings.$inferSelect;
export type NewClinicNotificationSettings = typeof clinicNotificationSettings.$inferInsert;
