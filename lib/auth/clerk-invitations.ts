// lib/auth/clerk-invitations.ts
import { clerkClient } from '@clerk/nextjs/server';

/**
 * The created membership's id is stashed in publicMetadata — this is the
 * exact mechanism the `user.created` webhook handler already checks for
 * (see user-provisioning.service.ts) to decide "invited staff joining"
 * vs. "brand-new clinic owner signup." This function is what actually
 * produces that metadata; without it, the webhook's membershipId branch
 * would never fire.
 */
export async function sendStaffInvitation(params: {
  emailAddress: string;
  membershipId: string;
}) {
  const client = await clerkClient();

  // TODO: point this at a dedicated "accept invite" route once the
  // frontend has one; the plain sign-up page works for now since Clerk's
  // invitation flow pre-fills the email either way.
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`;

  return client.invitations.createInvitation({
    emailAddress: params.emailAddress,
    redirectUrl,
    publicMetadata: { membershipId: params.membershipId },
  });
}