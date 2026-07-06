// src/lib/auth/request-context.ts
import { auth } from '@clerk/nextjs/server';
import { UnauthenticatedError, ForbiddenError } from '@/lib/errors/app-error';
import { findUserByClerkId, listActiveMembershipsForUser } from './user-provisioning.repository';
import type { MembershipRole } from '@/db/schema';

export interface RequestContext {
  userId: string;
  clerkUserId: string;
  clinicId: string;
  membershipId: string;
  role: MembershipRole;
}

/**
 * Stands in for Part 2's middleware steps 1–2 (authentication + tenant
 * resolution) until real `src/middleware.ts` exists. Called at the top of
 * every module's route handlers, the same way middleware would attach
 * `ctx` to the request. Nothing in the service or repository layers needs
 * to change when formal middleware replaces this — they only ever
 * receive an already-resolved RequestContext, never raw Clerk data.
 *
 * Step 3 (authorization / role checks) is deliberately NOT done here —
 * Part 8 requires those live in the service layer, since permission
 * rules differ per action, not just per route.
 */
export async function getRequestContext(): Promise<RequestContext> {
  const { isAuthenticated, userId: clerkUserId } = await auth();
  if (!isAuthenticated || !clerkUserId) {
    throw new UnauthenticatedError();
  }

  const user = await findUserByClerkId(clerkUserId);
  if (!user) {
    // Clerk session exists but the webhook hasn't provisioned this user
    // yet (e.g. reading right after signup) — treat as unauthenticated
    // rather than crash, since it's a legitimate, if rare, timing case.
    throw new UnauthenticatedError('Account setup is still finishing — please try again shortly');
  }

  const activeMemberships = await listActiveMembershipsForUser(user.id);

  if (activeMemberships.length === 0) {
    throw new ForbiddenError('NO_ACTIVE_MEMBERSHIP', 'This account has no active clinic membership');
  }

  if (activeMemberships.length > 1) {
    // TODO: once the clinic-switcher UI exists (Part 8), resolve the
    // active clinic from a session claim instead of erroring here.
    throw new ForbiddenError(
      'CLINIC_SWITCHER_REQUIRED',
      'This account belongs to multiple clinics — clinic switching is not yet implemented',
    );
  }

  const membership = activeMemberships[0];
  return {
    userId: user.id,
    clerkUserId,
    clinicId: membership.clinicId,
    membershipId: membership.id,
    role: membership.role,
  };
}