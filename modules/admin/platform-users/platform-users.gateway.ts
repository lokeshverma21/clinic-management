// modules/admin/platform-users/platform-users.gateway.ts
import 'server-only';
import { clerkClient } from '@clerk/nextjs/server';
import type { ClerkUserLookupResult } from './platform-users.types';

/**
 * Clerk Integration Gateway for Platform Users
 *
 * NOTE: This is the ONLY file in the platform-users module that interacts
 * with the external Clerk backend API.
 *
 * Privacy guarantee:
 * Never logs or returns any sensitive properties from the Clerk user object.
 * Only extracts `clerkUserId`, verified `email`, and `fullName`.
 */
interface ClerkEmailAddress {
  emailAddress: string;
  verification?: {
    status?: string | null;
  } | null;
}

interface ClerkUserSummary {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  emailAddresses?: ClerkEmailAddress[];
}

export async function findClerkUserByEmail(
  email: string,
): Promise<ClerkUserLookupResult | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  const client = await clerkClient();

  const userListResponse = await client.users.getUserList({
    emailAddress: [normalizedEmail],
  });

  const users: readonly ClerkUserSummary[] = userListResponse.data;

  if (!users || users.length === 0) {
    return null;
  }

  for (const user of users) {
    // Only accept user if the matching email address has verified status
    const matchingEmail = user.emailAddresses?.find(
      (e: ClerkEmailAddress) => e.emailAddress.toLowerCase() === normalizedEmail,
    );

    if (matchingEmail && matchingEmail.verification?.status === 'verified') {
      const nameParts = [user.firstName, user.lastName].filter(
        (part): part is string => typeof part === 'string' && part.trim().length > 0,
      );

      const fullName = nameParts.length > 0 ? nameParts.join(' ').trim() : normalizedEmail;

      return {
        clerkUserId: user.id,
        fullName,
        email: normalizedEmail,
      };
    }
  }

  return null;
}
