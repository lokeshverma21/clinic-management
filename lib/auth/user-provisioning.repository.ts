// /lib/auth/user-provisioning.repository.ts
import { and, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, clinics, memberships } from '@/db/schema';
import type { NewUser, NewClinic, NewMembership } from '@/db/schema';

export async function findUserByClerkId(clerkUserId: string) {
  const [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)).limit(1);
  return user ?? null;
}

export async function findMembershipById(membershipId: string) {
  const [membership] = await db
    .select()
    .from(memberships)
    .where(eq(memberships.id, membershipId))
    .limit(1);
  return membership ?? null;
}

export async function updateUserByClerkId(clerkUserId: string, patch: Partial<NewUser>) {
  const [user] = await db
    .update(users)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(users.clerkUserId, clerkUserId))
    .returning();
  return user ?? null;
}

export async function listActiveMembershipsForUser(userId: string) {
  return db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.status, 'active')));
}

/**
 * Creates the internal user row, a brand-new trial clinic, and the owner
 * membership in a single transaction — Part 7's "first user for a
 * brand-new clinic" path. All three rows succeed together or not at all.
 */
export async function createUserWithOwnerClinic(input: {
  user: NewUser;
  clinic: Omit<NewClinic, 'id' | 'createdAt' | 'updatedAt'>;
}) {
  return db.transaction(async (tx) => {
    const [user] = await tx.insert(users).values(input.user).returning();
    const [clinic] = await tx.insert(clinics).values(input.clinic).returning();
    const membershipInput: NewMembership = {
      clinicId: clinic.id,
      userId: user.id,
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
    };
    const [membership] = await tx.insert(memberships).values(membershipInput).returning();
    return { user, clinic, membership };
  });
}

/**
 * Creates the internal user row and links it to a pre-existing "invited"
 * membership row — Part 7's staff invitation flow, step 4.
 */
export async function createUserAndActivateMembership(input: {
  user: NewUser;
  membershipId: string;
}) {
  return db.transaction(async (tx) => {
    const [user] = await tx.insert(users).values(input.user).returning();
    const [membership] = await tx
      .update(memberships)
      .set({ userId: user.id, status: 'active', joinedAt: new Date(), updatedAt: new Date() })
      .where(eq(memberships.id, input.membershipId))
      .returning();
    return { user, membership };
  });
}

/**
 * Deactivates every membership for a user without deleting anything —
 * Part 6/7: "never hard-delete — audit trail."
 */
export async function deactivateAllMembershipsForClerkUser(clerkUserId: string) {
  const user = await findUserByClerkId(clerkUserId);
  if (!user) return;

  await db
    .update(memberships)
    .set({ status: 'deactivated', updatedAt: new Date() })
    .where(eq(memberships.userId, user.id));
}
