// modules/admin/platform-users/platform-users.repository.ts
import 'server-only';
import { db } from '@/db/client';
import { platformUsers, type PlatformUser, type NewPlatformUser } from '@/db/schema';
import { eq, or, asc, sql } from 'drizzle-orm';
import type { PlatformRole } from './platform-users.types';

export type DbClient = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Platform Users Repository
 *
 * NOTE: The `platform_users` table is intentionally NOT scoped to any `clinic_id`.
 * Unlike tenant-level repositories where multi-tenancy requires strict clinic partitioning,
 * platform users represent the internal administrative and support staff of ClinicSeva
 * who manage the SaaS platform as a whole.
 */

export async function listPlatformUsers(
  tx: DbClient = db,
): Promise<PlatformUser[]> {
  return tx
    .select()
    .from(platformUsers)
    .orderBy(asc(platformUsers.createdAt));
}

export async function getPlatformUserById(
  id: string,
  tx: DbClient = db,
): Promise<PlatformUser | null> {
  const [row] = await tx
    .select()
    .from(platformUsers)
    .where(eq(platformUsers.id, id))
    .limit(1);

  return row ?? null;
}

export async function findPlatformUserByEmailOrClerkId(
  email: string,
  clerkUserId: string,
  tx: DbClient = db,
): Promise<PlatformUser | null> {
  const normalizedEmail = email.trim().toLowerCase();

  const [row] = await tx
    .select()
    .from(platformUsers)
    .where(
      or(
        eq(platformUsers.email, normalizedEmail),
        eq(platformUsers.clerkUserId, clerkUserId),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function countSuperAdmins(
  tx: DbClient = db,
  lock = false,
): Promise<number> {
  if (lock) {
    // Acquire row-level locks on super_admin rows inside the transaction
    const rows = await tx
      .select({ id: platformUsers.id })
      .from(platformUsers)
      .where(eq(platformUsers.role, 'super_admin'))
      .for('update');
    return rows.length;
  }

  const [row] = await tx
    .select({ count: sql<number>`count(*)::int` })
    .from(platformUsers)
    .where(eq(platformUsers.role, 'super_admin'));

  return row?.count ?? 0;
}

export async function insertPlatformUser(
  input: NewPlatformUser,
  tx: DbClient = db,
): Promise<PlatformUser> {
  const [created] = await tx
    .insert(platformUsers)
    .values(input)
    .returning();

  return created;
}

export async function updatePlatformUserRole(
  id: string,
  role: PlatformRole,
  tx: DbClient = db,
): Promise<PlatformUser> {
  const [updated] = await tx
    .update(platformUsers)
    .set({
      role,
      updatedAt: new Date(),
    })
    .where(eq(platformUsers.id, id))
    .returning();

  return updated;
}

export async function deletePlatformUser(
  id: string,
  tx: DbClient = db,
): Promise<void> {
  await tx.delete(platformUsers).where(eq(platformUsers.id, id));
}
