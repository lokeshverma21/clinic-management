// modules/admin/dashboard/dashboard.repository.ts
import 'server-only';
import { db } from '@/db/client';
import { clinics, subscriptions } from '@/db/schema';
import { eq, and, gte, lte, sql, inArray, isNull, isNotNull, desc } from 'drizzle-orm';
import type { ClinicStatus, ClinicSuspensionSource } from './dashboard.types';

/**
 * Platform Dashboard Repository (READ-ONLY)
 *
 * NOTE: Functions in this repository are intentionally NOT scoped with `clinicId`
 * as the first parameter. Unlike tenant-level repositories where multi-tenancy
 * requires strict clinic partitioning, platform dashboard operations are platform-wide
 * administrative read-only aggregations across all tenants and subscriptions.
 *
 * READ-ONLY GUARANTEE:
 * This repository contains ZERO write, update, or delete operations. It strictly queries
 * and aggregates data from `clinics` and `subscriptions`.
 */

export async function countClinicsByStatus(): Promise<Record<ClinicStatus, number>> {
  const statusCounts: Record<ClinicStatus, number> = {
    trial: 0,
    active: 0,
    past_due: 0,
    suspended: 0,
    canceled: 0,
  };

  const rows = await db
    .select({
      status: clinics.status,
      count: sql<number>`count(*)::int`,
    })
    .from(clinics)
    .groupBy(clinics.status);

  for (const row of rows) {
    if (row.status in statusCounts) {
      statusCounts[row.status as ClinicStatus] = row.count;
    }
  }

  return statusCounts;
}

export async function countSignupsByMonth(
  months: number,
): Promise<{ month: string; count: number }[]> {
  const safeMonths = Math.max(1, months);

  const rows = await db
    .select({
      month: sql<string>`to_char((${clinics.createdAt} at time zone 'UTC'), 'YYYY-MM')`,
      count: sql<number>`count(*)::int`,
    })
    .from(clinics)
    .where(
      sql`${clinics.createdAt} >= (now() at time zone 'UTC') - (${safeMonths} || ' months')::interval`,
    )
    .groupBy(sql`to_char((${clinics.createdAt} at time zone 'UTC'), 'YYYY-MM')`)
    .orderBy(sql`to_char((${clinics.createdAt} at time zone 'UTC'), 'YYYY-MM')`);

  return rows.map((r) => ({
    month: r.month,
    count: Number(r.count),
  }));
}

export async function listTrialsEndingSoon(
  days: number,
  limit: number,
): Promise<{ clinicId: string; clinicName: string; trialEndsAt: Date }[]> {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      clinicId: clinics.id,
      clinicName: clinics.name,
      trialEndsAt: clinics.trialEndsAt,
    })
    .from(clinics)
    .where(
      and(
        eq(clinics.status, 'trial'),
        isNotNull(clinics.trialEndsAt),
        gte(clinics.trialEndsAt, now),
        lte(clinics.trialEndsAt, future),
      ),
    )
    .orderBy(clinics.trialEndsAt)
    .limit(limit);

  return rows
    .filter((r): r is { clinicId: string; clinicName: string; trialEndsAt: Date } =>
      Boolean(r.trialEndsAt),
    )
    .map((r) => ({
      clinicId: r.clinicId,
      clinicName: r.clinicName,
      trialEndsAt: r.trialEndsAt,
    }));
}

export async function countTrialsEndingSoon(days: number): Promise<number> {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const [row] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(clinics)
    .where(
      and(
        eq(clinics.status, 'trial'),
        isNotNull(clinics.trialEndsAt),
        gte(clinics.trialEndsAt, now),
        lte(clinics.trialEndsAt, future),
      ),
    );

  return row?.count ?? 0;
}

export async function listAtRiskClinics(
  limit: number,
): Promise<{
  clinicId: string;
  clinicName: string;
  status: ClinicStatus;
  suspensionSource: ClinicSuspensionSource | null;
  pastDueSince: Date | null;
}[]> {
  const atRiskStatuses: ClinicStatus[] = ['past_due', 'suspended'];

  const rows = await db
    .select({
      clinicId: clinics.id,
      clinicName: clinics.name,
      status: clinics.status,
      suspensionSource: clinics.suspensionSource,
      pastDueSince: clinics.pastDueSince,
    })
    .from(clinics)
    .where(inArray(clinics.status, atRiskStatuses))
    .orderBy(
      sql`CASE 
        WHEN ${clinics.status} = 'past_due' THEN 1 
        WHEN ${clinics.status} = 'suspended' AND ${clinics.suspensionSource} = 'billing' THEN 2 
        ELSE 3 
      END`,
      sql`${clinics.pastDueSince} ASC NULLS LAST`,
      desc(clinics.createdAt),
    )
    .limit(limit);

  return rows.map((r) => ({
    clinicId: r.clinicId,
    clinicName: r.clinicName,
    status: r.status as ClinicStatus,
    suspensionSource: r.suspensionSource as ClinicSuspensionSource | null,
    pastDueSince: r.pastDueSince,
  }));
}

export async function getActiveSubscriptionsByPlan(): Promise<{
  plan: string;
  count: number;
}[]> {
  const rows = await db
    .select({
      plan: subscriptions.plan,
      count: sql<number>`count(*)::int`,
    })
    .from(subscriptions)
    .where(and(eq(subscriptions.status, 'active'), isNull(subscriptions.deletedAt)))
    .groupBy(subscriptions.plan);

  return rows.map((r) => ({
    plan: r.plan,
    count: Number(r.count),
  }));
}
