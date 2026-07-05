import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { platformRoleEnum } from './enums';

/**
 * NOT part of the Part 6 blueprint — added for your own team's /admin
 * surface. Kept as a fully separate table (not a role on `users`, not a
 * `memberships` row) on purpose: Part 8's entire isolation model rests on
 * "every tenant-specific table's clinic_id comes from a resolved
 * membership." A platform admin has no clinic and must never be resolvable
 * through that same path — mixing the two identities is exactly the kind
 * of cross-tenant bug Part 8 is designed to prevent.
 *
 * Recommend backing this with its own Clerk organization (or a separate
 * allow-listed sign-in flow) so platform-admin auth never shares a code
 * path with clinic tenant-resolution middleware.
 */
export const platformUsers = pgTable('platform_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  role: platformRoleEnum('role').notNull().default('support'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type PlatformUser = typeof platformUsers.$inferSelect;
export type NewPlatformUser = typeof platformUsers.$inferInsert;
