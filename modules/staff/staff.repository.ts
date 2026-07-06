// modules/staff/staff.repository.ts
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db/client';
import { memberships, staffProfiles, users, auditLogs } from '@/db/schema';
import type { Membership, MembershipRole, NewMembership, NewStaffProfile } from '@/db/schema';

export async function listStaff(clinicId: string) {
  return db
    .select({ membership: memberships, user: users, staffProfile: staffProfiles })
    .from(memberships)
    .leftJoin(users, eq(users.id, memberships.userId))
    .leftJoin(staffProfiles, eq(staffProfiles.membershipId, memberships.id))
    .where(eq(memberships.clinicId, clinicId))
    .orderBy(memberships.createdAt);
}

export async function getMembershipInClinic(clinicId: string, membershipId: string): Promise<Membership | null> {
  const [membership] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.clinicId, clinicId), eq(memberships.id, membershipId)))
    .limit(1);
  return membership ?? null;
}

export async function countActiveOwners(clinicId: string): Promise<number> {
  const rows = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.clinicId, clinicId), eq(memberships.role, 'owner'), eq(memberships.status, 'active')));
  return rows.length;
}

/**
 * Part 9: "cannot invite a duplicate active membership for the same
 * email at the same clinic." Checks both pending invites (matched by the
 * stashed invitedEmail) and already-active members (matched by their
 * current, possibly-changed, users.email).
 */
export async function findExistingMembershipByEmail(clinicId: string, email: string): Promise<Membership | null> {
  const [pending] = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.clinicId, clinicId),
        eq(memberships.invitedEmail, email),
        inArray(memberships.status, ['invited', 'active']),
      ),
    )
    .limit(1);
  if (pending) return pending;

  const [activeRow] = await db
    .select({ membership: memberships })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(and(eq(memberships.clinicId, clinicId), eq(users.email, email), eq(memberships.status, 'active')))
    .limit(1);
  return activeRow?.membership ?? null;
}

export async function insertInvitedMembership(
  clinicId: string,
  role: MembershipRole,
  invitedEmail: string,
): Promise<Membership> {
  const values: NewMembership = {
    clinicId,
    role,
    status: 'invited',
    invitedEmail,
    invitedAt: new Date(),
  };
  const [membership] = await db.insert(memberships).values(values).returning();
  return membership;
}

export async function updateMembership(
  clinicId: string,
  membershipId: string,
  patch: Partial<Pick<NewMembership, 'role' | 'status'>>,
): Promise<Membership | null> {
  const [membership] = await db
    .update(memberships)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(memberships.clinicId, clinicId), eq(memberships.id, membershipId)))
    .returning();
  return membership ?? null;
}

export async function upsertStaffProfile(
  membershipId: string,
  patch: Partial<Pick<NewStaffProfile, 'specialization' | 'workingHours' | 'colorTag'>>,
) {
  const [existing] = await db
    .select({ id: staffProfiles.id })
    .from(staffProfiles)
    .where(eq(staffProfiles.membershipId, membershipId))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(staffProfiles)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(staffProfiles.membershipId, membershipId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(staffProfiles)
    .values({ membershipId, ...patch })
    .returning();
  return created;
}

/**
 * Part 9: role changes are logged to audit_logs — who changed whose
 * role, when.
 */
export async function insertAuditLog(input: {
  clinicId: string;
  actorMembershipId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await db.insert(auditLogs).values({
    clinicId: input.clinicId,
    actorMembershipId: input.actorMembershipId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    metadata: input.metadata ?? null,
  });
}