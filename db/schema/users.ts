import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * One row per human who can log in. Deliberately has NO clinic_id — a
 * person can belong to multiple clinics via `memberships` (Part 6/8).
 * The only writer of this table should be the Clerk `user.created`
 * webhook handler (Part 7) — never a signup/invite form handler directly.
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
