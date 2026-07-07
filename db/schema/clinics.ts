import { pgTable, uuid, text, jsonb, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { clinicStatusEnum } from './enums';
import type { WeeklyHours } from './shared-types';

/**
 * The tenant table — one row per paying clinic. Anchor of tenant isolation:
 * every other tenant-specific table's clinic_id FK points here (Part 8).
 */
export const clinics = pgTable(
  'clinics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    phone: text('phone'),
    address: text('address'),
    timezone: text('timezone').notNull(),
    // Both added for the Clinic Profile module (Part 9), which documents
    // "upload logo" and "set clinic-wide operating hours" as features —
    // Part 6's original table didn't have columns for either.
    logoUrl: text('logo_url'),
    operatingHours: jsonb('operating_hours').$type<WeeklyHours>(),
    status: clinicStatusEnum('status').notNull().default('trial'),
    trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('clinics_slug_idx').on(table.slug),
  }),
);

export type Clinic = typeof clinics.$inferSelect;
export type NewClinic = typeof clinics.$inferInsert;