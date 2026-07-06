import { pgTable, uuid, text, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { membershipRoleEnum, membershipStatusEnum } from './enums';
import { clinics } from './clinics';
import { users } from './users';

/**
 * The core of multi-tenancy (Part 8). userId is nullable to represent an
 * "invited but not yet joined" row (Part 7's staff invitation flow) — the
 * Clerk webhook fills it in once the invited person signs up.
 */
export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'restrict' }),
    role: membershipRoleEnum('role').notNull(),
    status: membershipStatusEnum('status').notNull().default('invited'),
    // Part 7's invite flow needs an identifier for a pending membership
    // before it has a user_id — this is that identifier, and it's also
    // what the Staff module checks to block duplicate invites (Part 9).
    // Kept populated after joining too, as a record of who was invited.
    invitedEmail: text('invited_email'),
    invitedAt: timestamp('invited_at', { withTimezone: true }),
    joinedAt: timestamp('joined_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // Postgres treats NULLs as distinct, so multiple pending invites
    // (user_id still null) per clinic are allowed under this constraint.
    clinicUserUnique: uniqueIndex('memberships_clinic_user_unique').on(
      table.clinicId,
      table.userId,
    ),
    clinicIdx: index('memberships_clinic_idx').on(table.clinicId),
    userIdx: index('memberships_user_idx').on(table.userId),
  }),
);

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
export type MembershipRole = Membership['role'];