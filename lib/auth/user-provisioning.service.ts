// /lib/auth/user-provisioning.service.ts
import type { ClerkWebhookEvent, ClerkUserEventData } from './user-provisioning.types';
import {
  findUserByClerkId,
  findMembershipById,
  findPendingMembershipsByEmail,
  createUserWithoutMembership,
  updateUserByClerkId,
  createUserWithOwnerClinic,
  createUserAndActivateMembership,
  deactivateAllMembershipsForClerkUser,
} from './user-provisioning.repository';

function primaryEmail(data: ClerkUserEventData): string {
  const match = data.email_addresses.find((e) => e.id === data.primary_email_address_id);
  const email = match?.email_address ?? data.email_addresses[0]?.email_address;
  if (!email) {
    throw new Error(`Clerk user ${data.id} has no email address`);
  }
  return email;
}

function primaryEmailObj(data: ClerkUserEventData) {
  const match = data.email_addresses.find((e) => e.id === data.primary_email_address_id);
  return match ?? data.email_addresses[0];
}

function isEmailVerified(emailObj: unknown): boolean {
  if (typeof emailObj !== 'object' || emailObj === null) return false;
  const candidate = emailObj as Record<string, unknown>;
  const verification = candidate.verification;
  if (typeof verification !== 'object' || verification === null) return false;
  return (verification as Record<string, unknown>).status === 'verified';
}



function primaryPhone(data: ClerkUserEventData): string | null {
  const match = data.phone_numbers.find((p) => p.id === data.primary_phone_number_id);
  return match?.phone_number ?? data.phone_numbers[0]?.phone_number ?? null;
}

function fullName(data: ClerkUserEventData): string {
  return [data.first_name, data.last_name].filter(Boolean).join(' ') || 'New user';
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
}

/**
 * Handles `user.created`. Two branches, distinguished by public_metadata:
 *
 * - `membershipId` present → an invited staff member accepting their
 *   invite (Part 7's invitation flow). The invite-sending code (Staff
 *   module — not built yet) is expected to stash the pending membership's
 *   id in the Clerk invitation's public_metadata so this handler knows
 *   which membership row to activate. This mapping is a concrete
 *   implementation choice, not something Part 7 spells out — flag it for
 *   review once the Staff module's invite flow is built.
 *
 * - `membershipId` absent → a brand-new clinic owner signup. A minimal
 *   trial clinic is created immediately so signup finishes in one step
 *   (Part 1's "under 15 minutes" goal); the owner fills in the real
 *   clinic name/timezone afterwards via the Clinic Profile module
 *   (Part 9) — the defaults below are deliberately provisional.
 */
const defaultDeps = {
  findUserByClerkId,
  findMembershipById,
  findPendingMembershipsByEmail,
  createUserWithoutMembership,
  createUserAndActivateMembership,
  createUserWithOwnerClinic,
};

export type UserProvisioningDeps = typeof defaultDeps;

export async function handleUserCreated(
  data: ClerkUserEventData,
  deps: UserProvisioningDeps = defaultDeps,
) {
  const existing = await deps.findUserByClerkId(data.id);
  if (existing) {
    // Svix retries deliveries — this must be a safe no-op (Part 17).
    return { status: 'already_processed' as const };
  }

  const emailObj = primaryEmailObj(data);
  const email = primaryEmail(data);
  const phone = primaryPhone(data);
  const name = fullName(data);
  const membershipId = data.public_metadata?.membershipId;

  if (typeof membershipId === 'string') {
    const membership = await deps.findMembershipById(membershipId);
    if (!membership) {
      throw new Error(
        `No membership found for id ${membershipId} referenced by Clerk user ${data.id}`,
      );
    }

    const result = await deps.createUserAndActivateMembership({
      user: { clerkUserId: data.id, fullName: name, email, phone },
      membershipId,
    });
    return { status: 'staff_joined' as const, ...result };
  }

  // Fallback: check pending memberships by email ONLY when email is verified
  if (isEmailVerified(emailObj)) {
    const pendingMatches = await deps.findPendingMembershipsByEmail(email);

    if (pendingMatches.length === 1) {
      const result = await deps.createUserAndActivateMembership({
        user: { clerkUserId: data.id, fullName: name, email, phone },
        membershipId: pendingMatches[0].id,
      });
      return { status: 'staff_joined' as const, ...result };
    }

    if (pendingMatches.length > 1) {
      console.error(
        `[user-provisioning] clerkUserId="${data.id}" multiple pending memberships found: count=${pendingMatches.length}`,
      );
      const user = await deps.createUserWithoutMembership({
        clerkUserId: data.id,
        fullName: name,
        email,
        phone,
      });
      return { status: 'ambiguous_membership' as const, user };
    }
  }

  const result = await deps.createUserWithOwnerClinic({
    user: { clerkUserId: data.id, fullName: name, email, phone },
    clinic: {
      name: `${name}'s Clinic`,
      slug: `${slugify(name)}-${data.id.slice(-6)}`,
      phone: null,
      address: null,
      timezone: 'UTC',
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });
  return { status: 'clinic_created' as const, ...result };
}

export async function handleUserUpdated(data: ClerkUserEventData) {
  const email = primaryEmail(data);
  const phone = primaryPhone(data);
  const name = fullName(data);

  const user = await updateUserByClerkId(data.id, { fullName: name, email, phone });
  if (!user) {
    // user.updated for a Clerk id with no internal row — surface it rather
    // than silently ignoring, since Part 7 treats `users` as a mirror that
    // should never drift from Clerk's identity source of truth.
    throw new Error(`user.updated received for unknown Clerk user ${data.id}`);
  }
  return { status: 'updated' as const, user };
}

export async function handleUserDeleted(clerkUserId: string) {
  await deactivateAllMembershipsForClerkUser(clerkUserId);
  return { status: 'deactivated' as const };
}

export async function handleClerkWebhookEvent(event: ClerkWebhookEvent) {
  switch (event.type) {
    case 'user.created':
      return handleUserCreated(event.data as ClerkUserEventData);
    case 'user.updated':
      return handleUserUpdated(event.data as ClerkUserEventData);
    case 'user.deleted':
      return handleUserDeleted((event.data as { id: string }).id);
    default:
      // Other Clerk event types (session.*, organization.*, ...) are not
      // wired up yet — ignore rather than error.
      return { status: 'ignored' as const };
  }
}
