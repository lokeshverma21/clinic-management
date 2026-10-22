import { pgTable, uuid, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { platformUsers } from './platformUsers';
import { clinics } from './clinics';

/**
 * Platform-level audit trail for administrative actions performed by platform admins.
 * Unlike the clinic-scoped `audit_logs` table, entries here represent actions taken
 * at the platform level across any or no clinic.
 *
 * Foreign keys use onDelete: 'set null' so that the audit trail remains permanently
 * intact even if an administrator account is deleted or a clinic is dropped.
 */
export const platformAuditLogs = pgTable(
  'platform_audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorPlatformUserId: uuid('actor_platform_user_id').references(() => platformUsers.id, {
      onDelete: 'set null',
    }),
    actorEmail: text('actor_email').notNull(),
    action: text('action').notNull(), // format "entity.verb", e.g. "clinic.suspended"
    targetType: text('target_type').notNull(),
    targetId: text('target_id'),
    clinicId: uuid('clinic_id').references(() => clinics.id, {
      onDelete: 'set null',
    }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    createdAtIdx: index('platform_audit_logs_created_at_idx').on(table.createdAt),
    clinicIdx: index('platform_audit_logs_clinic_idx').on(table.clinicId),
    actorIdx: index('platform_audit_logs_actor_idx').on(table.actorPlatformUserId),
    actionIdx: index('platform_audit_logs_action_idx').on(table.action),
  }),
);

export type PlatformAuditLog = typeof platformAuditLogs.$inferSelect;
export type NewPlatformAuditLog = typeof platformAuditLogs.$inferInsert;
