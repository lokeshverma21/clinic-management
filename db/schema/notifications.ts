import { pgTable, uuid, timestamp, text, index } from 'drizzle-orm/pg-core';
import {
  notificationTypeEnum,
  notificationChannelEnum,
  notificationStatusEnum,
} from './enums';
import { clinics } from './clinics';
import { appointments } from './appointments';
import { patients } from './patients';

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id, { onDelete: 'cascade' }),
    // Nullable — notifications can exist outside appointment context later (Part 6)
    appointmentId: uuid('appointment_id').references(() => appointments.id, {
      onDelete: 'set null',
    }),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull(),
    channel: notificationChannelEnum('channel').notNull().default('whatsapp'),
    status: notificationStatusEnum('status').notNull().default('scheduled'),
    scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    failureReason: text('failure_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // For the background job to efficiently find due notifications (Part 6/16)
    statusScheduledIdx: index('notifications_status_scheduled_idx').on(
      table.status,
      table.scheduledFor,
    ),
  }),
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
