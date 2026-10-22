import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { platformUsers } from '@/db/schema';
import type { PlatformUser } from '@/db/schema';

/**
 * Note: `platform_users` is intentionally NOT tenant-scoped because platform
 * administrators oversee the entire application and are not tied to any single clinic.
 * Therefore, this query has no `clinicId` parameter.
 */
export async function findPlatformUserByClerkId(clerkUserId: string): Promise<PlatformUser | null> {
  const [user] = await db
    .select()
    .from(platformUsers)
    .where(eq(platformUsers.clerkUserId, clerkUserId))
    .limit(1);

  return user ?? null;
}
