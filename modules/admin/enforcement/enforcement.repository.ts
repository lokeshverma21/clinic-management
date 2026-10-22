// modules/admin/enforcement/enforcement.repository.ts
import { and, eq, isNotNull, isNull, lte } from 'drizzle-orm';
import { db } from '@/db/client';
import { clinics, subscriptions, type Clinic } from '@/db/schema';
import type { ClinicStatus } from '@/lib/policy/subscription-policy';

export type DbClient = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Step 1: Backfill clinics in 'past_due' status that have a null pastDueSince timestamp.
 * Does NOT suspend clinics in this pass.
 */
export async function backfillPastDueClinics(
  now: Date = new Date(),
  tx: DbClient = db,
): Promise<number> {
  const updated = await tx
    .update(clinics)
    .set({ pastDueSince: now, updatedAt: now })
    .where(and(eq(clinics.status, 'past_due'), isNull(clinics.pastDueSince)))
    .returning({ id: clinics.id });

  return updated.length;
}

/**
 * Step 2: Find candidate clinics in 'past_due' status whose pastDueSince is older
 * than the grace period cutoff date.
 */
export async function findPastDueGraceExpiredClinics(
  cutoffDate: Date,
  tx: DbClient = db,
): Promise<Array<{ id: string; status: ClinicStatus }>> {
  const rows = await tx
    .select({
      id: clinics.id,
      status: clinics.status,
    })
    .from(clinics)
    .where(
      and(
        eq(clinics.status, 'past_due'),
        isNotNull(clinics.pastDueSince),
        lte(clinics.pastDueSince, cutoffDate),
      ),
    );

  return rows as Array<{ id: string; status: ClinicStatus }>;
}

/**
 * Step 3: Find candidate clinics in 'trial' status whose trialEndsAt is older
 * than the grace period cutoff date and have no active subscription.
 */
export async function findTrialExpiredClinics(
  cutoffDate: Date,
  tx: DbClient = db,
): Promise<Array<{ id: string; status: ClinicStatus }>> {
  const rows = await tx
    .selectDistinct({
      id: clinics.id,
      status: clinics.status,
    })
    .from(clinics)
    .leftJoin(
      subscriptions,
      and(
        eq(subscriptions.clinicId, clinics.id),
        eq(subscriptions.status, 'active'),
        isNull(subscriptions.deletedAt),
      ),
    )
    .where(
      and(
        eq(clinics.status, 'trial'),
        isNotNull(clinics.trialEndsAt),
        lte(clinics.trialEndsAt, cutoffDate),
        isNull(subscriptions.id),
      ),
    );

  return rows as Array<{ id: string; status: ClinicStatus }>;
}

/**
 * Atomically suspends a clinic with optimistic verification of its previous status.
 * Re-checking `expectedStatus` in the WHERE clause guarantees that any concurrent
 * status modification (such as a successful webhook payment) will not be overwritten.
 */
export async function suspendClinicWithExpectedStatus(
  clinicId: string,
  expectedStatus: ClinicStatus,
  suspensionSource: NonNullable<Clinic['suspensionSource']>,
  now: Date = new Date(),
  tx: DbClient = db,
): Promise<boolean> {
  const [updated] = await tx
    .update(clinics)
    .set({
      status: 'suspended',
      suspensionSource,
      updatedAt: now,
    })
    .where(
      and(
        eq(clinics.id, clinicId),
        eq(clinics.status, expectedStatus),
      ),
    )
    .returning({ id: clinics.id });

  return Boolean(updated);
}
