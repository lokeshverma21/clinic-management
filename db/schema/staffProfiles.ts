import { pgTable, uuid, text, jsonb, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { memberships } from './memberships';

export type WorkingHours = Partial<Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', string[]>>;

export const staffProfiles = pgTable(
  'staff_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    membershipId: uuid('membership_id')
      .notNull()
      .references(() => memberships.id, { onDelete: 'cascade' }),
    specialization: text('specialization'),
    workingHours: jsonb('working_hours').$type<WorkingHours>(),
    colorTag: text('color_tag'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    membershipUnique: uniqueIndex('staff_profiles_membership_unique').on(table.membershipId),
  }),
);

export type StaffProfile = typeof staffProfiles.$inferSelect;
export type NewStaffProfile = typeof staffProfiles.$inferInsert;