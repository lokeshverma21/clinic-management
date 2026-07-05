// /lib/auth/user-provisioning.service.ts
import type { ClerkWebhookEvent, ClerkUserEventData } from './user-provisioning.types';
import {
  findUserByClerkId,
  findMembershipById,
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
export async function handleUserCreated(data: ClerkUserEventData) {
  const existing = await findUserByClerkId(data.id);
  if (existing) {
    // Svix retries deliveries — this must be a safe no-op (Part 17).
    return { status: 'already_processed' as const };
  }

  const email = primaryEmail(data);
  const phone = primaryPhone(data);
  const name = fullName(data);
  const membershipId = data.public_metadata?.membershipId;

  if (typeof membershipId === 'string') {
    const membership = await findMembershipById(membershipId);
    if (!membership) {
      throw new Error(
        `No membership found for id ${membershipId} referenced by Clerk user ${data.id}`,
      );
    }

    const result = await createUserAndActivateMembership({
      user: { clerkUserId: data.id, fullName: name, email, phone },
      membershipId,
    });
    return { status: 'staff_joined' as const, ...result };
  }

  const result = await createUserWithOwnerClinic({
    user: { clerkUserId: data.id, fullName: name, email, phone },
    clinic: {
      name: `${name}'s Clinic`,
      slug: `${slugify(name)}-${data.id.slice(-6)}`,
      phone: null,
      address: null,
      timezone: 'UTC',
      status: 'trial',
      trialEndsAt: null,
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
