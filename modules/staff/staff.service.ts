// modules/staff/staff.service.ts
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '@/lib/errors/app-error';
import type { RequestContext } from '@/lib/auth/request-context';
import { sendStaffInvitation } from '@/lib/auth/clerk-invitations';
import { countUpcomingAppointmentsForMembership } from '@/modules/appointments';
import * as staffRepository from './staff.repository';
import type {
  InviteStaffInput,
  UpdateStaffInput,
  StaffListItem,
  DeactivateStaffResult,
} from './staff.types';
import type { Membership } from '@/db/schema';

/**
 * Part 9: "owner-only for invite/role-change/deactivate." All roles can
 * view the staff list (that's `listStaff` below, which has no such gate).
 */
function assertOwner(ctx: RequestContext, action: string): void {
  if (ctx.role !== 'owner') {
    throw new ForbiddenError('OWNER_ONLY', `Only the clinic owner can ${action}`);
  }
}

export async function listStaff(ctx: RequestContext): Promise<StaffListItem[]> {
  const rows = await staffRepository.listStaff(ctx.clinicId);

  return rows.map((row) => ({
    membershipId: row.membership.id,
    role: row.membership.role,
    status: row.membership.status,
    invitedEmail: row.membership.invitedEmail,
    joinedAt: row.membership.joinedAt,
    user: row.user
      ? { id: row.user.id, fullName: row.user.fullName, email: row.user.email, phone: row.user.phone }
      : null,
    staffProfile: row.staffProfile
      ? {
          specialization: row.staffProfile.specialization,
          workingHours: row.staffProfile.workingHours,
          colorTag: row.staffProfile.colorTag,
        }
      : null,
  }));
}

export async function inviteStaff(ctx: RequestContext, input: InviteStaffInput): Promise<Membership> {
  assertOwner(ctx, 'invite staff');

  const existing = await staffRepository.findExistingMembershipByEmail(ctx.clinicId, input.email);
  if (existing) {
    throw new ConflictError(
      'DUPLICATE_INVITE',
      'This email already has an active membership or a pending invite at this clinic',
    );
  }

  const membership = await staffRepository.insertInvitedMembership(ctx.clinicId, input.role, input.email);

  try {
    await sendStaffInvitation({ emailAddress: input.email, membershipId: membership.id });
  } catch (error) {
    // The membership row is kept either way so the owner can see the
    // failed invite in the staff list and retry — Clerk's own
    // duplicate-email rejection surfaces here as a normal failure, not a
    // crash, and doesn't leave an orphaned Clerk-side invite with no
    // matching membership record.
    console.error('Failed to send Clerk invitation', error);
    throw new ConflictError(
      'INVITE_SEND_FAILED',
      'Could not send the invitation email — the address may already be registered with Clerk',
    );
  }

  return membership;
}

export async function updateStaff(
  ctx: RequestContext,
  membershipId: string,
  input: UpdateStaffInput,
): Promise<Membership> {
  assertOwner(ctx, 'change staff roles or details');

  const existing = await staffRepository.getMembershipInClinic(ctx.clinicId, membershipId);
  if (!existing) throw new NotFoundError('STAFF_NOT_FOUND', 'Staff member not found');

  // Part 9: a clinic must always have at least one owner — guards both
  // this role-change path and deactivateStaff below.
  if (input.role && input.role !== 'owner' && existing.role === 'owner' && existing.status === 'active') {
    const ownerCount = await staffRepository.countActiveOwners(ctx.clinicId);
    if (ownerCount <= 1) {
      throw new BadRequestError('LAST_OWNER', 'A clinic must always have at least one owner');
    }
  }

  let membership = existing;

  if (input.role && input.role !== existing.role) {
    const updated = await staffRepository.updateMembership(ctx.clinicId, membershipId, { role: input.role });
    if (!updated) throw new NotFoundError('STAFF_NOT_FOUND', 'Staff member not found');
    membership = updated;

    await staffRepository.insertAuditLog({
      clinicId: ctx.clinicId,
      actorMembershipId: ctx.membershipId,
      action: 'staff.role_changed',
      targetType: 'membership',
      targetId: membershipId,
      metadata: { oldRole: existing.role, newRole: input.role },
    });
  }

  const hasProfileUpdate =
    input.specialization !== undefined || input.workingHours !== undefined || input.colorTag !== undefined;

  if (hasProfileUpdate) {
    await staffRepository.upsertStaffProfile(membershipId, {
      ...(input.specialization !== undefined ? { specialization: input.specialization } : {}),
      ...(input.workingHours !== undefined ? { workingHours: input.workingHours } : {}),
      ...(input.colorTag !== undefined ? { colorTag: input.colorTag } : {}),
    });
  }

  return membership;
}

/**
 * Deactivate — never a hard delete (Part 6: audit trail). Warns rather
 * than blocks on upcoming appointments (Part 9 edge case).
 */
export async function deactivateStaff(ctx: RequestContext, membershipId: string): Promise<DeactivateStaffResult> {
  assertOwner(ctx, 'deactivate staff');

  const existing = await staffRepository.getMembershipInClinic(ctx.clinicId, membershipId);
  if (!existing) throw new NotFoundError('STAFF_NOT_FOUND', 'Staff member not found');

  if (existing.role === 'owner' && existing.status === 'active') {
    const ownerCount = await staffRepository.countActiveOwners(ctx.clinicId);
    if (ownerCount <= 1) {
      throw new BadRequestError('LAST_OWNER', 'Cannot deactivate the last remaining owner of a clinic');
    }
  }

  const membership = await staffRepository.updateMembership(ctx.clinicId, membershipId, { status: 'deactivated' });
  if (!membership) throw new NotFoundError('STAFF_NOT_FOUND', 'Staff member not found');

  const upcomingAppointmentsCount =
    existing.role === 'doctor'
      ? await countUpcomingAppointmentsForMembership(ctx, membershipId)
      : 0;

  return { membership, upcomingAppointmentsCount };
}