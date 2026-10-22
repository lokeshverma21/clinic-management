// modules/admin/clinics/clinics.repository.ts
import { and, desc, eq, ilike, inArray, isNull, or, sql, type SQL, asc } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  clinics,
  memberships,
  users,
  subscriptions,
  patients,
  appointments,
  type Clinic,
} from '@/db/schema';
import type {
  AdminClinicListItem,
  AdminClinicDetail,
  AdminClinicOwner,
  ListClinicsFilters,
  ClinicStatus,
} from './clinics.types';

/** The Drizzle database or transaction client handle type. */
export type DbClient = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Platform Clinics Repository
 *
 * NOTE: Functions in this repository are intentionally NOT scoped with `clinicId`
 * as the first parameter. Unlike tenant-level repositories where multi-tenancy
 * requires strict clinic partitioning, platform clinics operations are platform-level
 * administrative queries.
 *
 * READ MODEL ISOLATION:
 * Admin repositories are permitted to perform READ-ONLY aggregations across other
 * tables (memberships, users, subscriptions, patients, appointments) strictly to
 * construct administrative read models (e.g. usage statistics, owner info, counts).
 * All WRITES from this repository are strictly confined to the `clinics` table.
 * Crucially, clinical/patient details, appointment notes, and patient billing records
 * are never queried or exposed here—only aggregate counts.
 */

export async function listClinics(
  filters: ListClinicsFilters,
): Promise<{ rows: AdminClinicListItem[]; total: number }> {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
  const offset = (page - 1) * pageSize;

  const conditions: SQL[] = [];

  if (filters.status) {
    conditions.push(eq(clinics.status, filters.status));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(clinics.name, term),
        ilike(clinics.slug, term),
        ilike(clinics.phone, term),
      )!,
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rawRows = await db
    .select({
      clinic: clinics,
      subscription: {
        plan: subscriptions.plan,
        status: subscriptions.status,
      },
    })
    .from(clinics)
    .leftJoin(
      subscriptions,
      and(eq(subscriptions.clinicId, clinics.id), isNull(subscriptions.deletedAt)),
    )
    .where(whereClause)
    .orderBy(desc(clinics.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clinics)
    .where(whereClause);

  const total = countRow?.count ?? 0;

  const clinicIds = rawRows.map((r) => r.clinic.id);

  let ownerRows: Array<{
    clinicId: string;
    fullName: string;
    email: string;
  }> = [];

  if (clinicIds.length > 0) {
    ownerRows = await db
      .select({
        clinicId: memberships.clinicId,
        fullName: users.fullName,
        email: users.email,
      })
      .from(memberships)
      .innerJoin(users, eq(memberships.userId, users.id))
      .where(
        and(
          inArray(memberships.clinicId, clinicIds),
          eq(memberships.role, 'owner'),
          eq(memberships.status, 'active'),
        ),
      )
      .orderBy(asc(memberships.createdAt));
  }

  const rows: AdminClinicListItem[] = rawRows.map((r) => {
    const owner = ownerRows.find((o) => o.clinicId === r.clinic.id);
    return {
      id: r.clinic.id,
      name: r.clinic.name,
      slug: r.clinic.slug,
      phone: r.clinic.phone,
      status: r.clinic.status,
      trialEndsAt: r.clinic.trialEndsAt,
      onboardingCompletedAt: r.clinic.onboardingCompletedAt,
      createdAt: r.clinic.createdAt,
      ownerName: owner?.fullName ?? null,
      ownerEmail: owner?.email ?? null,
      plan: r.subscription?.plan ?? null,
      subscriptionStatus: r.subscription?.status ?? null,
    };
  });

  return { rows, total };
}

export async function getClinicById(
  clinicId: string,
  tx: DbClient = db,
): Promise<Clinic | null> {
  const [row] = await tx
    .select()
    .from(clinics)
    .where(eq(clinics.id, clinicId))
    .limit(1);

  return row ?? null;
}

export async function getClinicSubscription(
  clinicId: string,
  tx: DbClient = db,
): Promise<{ status: string; plan: string; billingCycle: string; currentPeriodEnd: Date; cashfreeSubscriptionId: string | null } | null> {
  const [row] = await tx
    .select({
      status: subscriptions.status,
      plan: subscriptions.plan,
      billingCycle: subscriptions.billingCycle,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      cashfreeSubscriptionId: subscriptions.cashfreeSubscriptionId,
    })
    .from(subscriptions)
    .where(and(eq(subscriptions.clinicId, clinicId), isNull(subscriptions.deletedAt)))
    .limit(1);

  return row ?? null;
}

export async function getClinicDetail(
  clinicId: string,
): Promise<AdminClinicDetail | null> {
  const [clinic] = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, clinicId))
    .limit(1);

  if (!clinic) return null;

  // Active owners
  const ownerRows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      phone: users.phone,
      role: memberships.role,
      status: memberships.status,
      joinedAt: memberships.joinedAt,
    })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(
      and(
        eq(memberships.clinicId, clinicId),
        eq(memberships.role, 'owner'),
        eq(memberships.status, 'active'),
      ),
    );

  const owners: AdminClinicOwner[] = ownerRows.map((o) => ({
    id: o.id,
    fullName: o.fullName,
    email: o.email,
    phone: o.phone,
    role: o.role,
    status: o.status,
    joinedAt: o.joinedAt,
  }));

  // Active staff counts by role
  const staffRows = await db
    .select({
      role: memberships.role,
      count: sql<number>`count(*)::int`,
    })
    .from(memberships)
    .where(
      and(
        eq(memberships.clinicId, clinicId),
        eq(memberships.status, 'active'),
      ),
    )
    .groupBy(memberships.role);

  let doctorCount = 0;
  let receptionistCount = 0;
  let ownerCount = 0;
  let totalStaff = 0;

  for (const s of staffRows) {
    const count = Number(s.count) || 0;
    totalStaff += count;
    if (s.role === 'doctor') doctorCount += count;
    else if (s.role === 'receptionist') receptionistCount += count;
    else if (s.role === 'owner') ownerCount += count;
  }

  // Patient count (active only, excluding soft-deleted)
  const [patientCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(patients)
    .where(
      and(
        eq(patients.clinicId, clinicId),
        isNull(patients.deletedAt),
      ),
    );

  const patientCount = patientCountRow?.count ?? 0;

  // Appointment counts (total and last 30 days, excluding soft-deleted)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [appointmentCountRow] = await db
    .select({
      total: sql<number>`count(*)::int`,
      last30Days: sql<number>`count(case when ${appointments.startTime} >= ${thirtyDaysAgo} then 1 end)::int`,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.clinicId, clinicId),
        isNull(appointments.deletedAt),
      ),
    );

  const appointmentCount = {
    total: appointmentCountRow?.total ?? 0,
    last30Days: appointmentCountRow?.last30Days ?? 0,
  };

  // Subscription summary (excluding soft-deleted)
  const [sub] = await db
    .select({
      plan: subscriptions.plan,
      status: subscriptions.status,
      billingCycle: subscriptions.billingCycle,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      cashfreeSubscriptionId: subscriptions.cashfreeSubscriptionId,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.clinicId, clinicId),
        isNull(subscriptions.deletedAt),
      ),
    )
    .limit(1);

  const subscriptionSummary = sub
    ? {
        plan: sub.plan,
        status: sub.status,
        billingCycle: sub.billingCycle,
        currentPeriodEnd: sub.currentPeriodEnd,
        cashfreeSubscriptionId: sub.cashfreeSubscriptionId,
      }
    : null;

  return {
    id: clinic.id,
    name: clinic.name,
    slug: clinic.slug,
    phone: clinic.phone,
    address: clinic.address,
    timezone: clinic.timezone,
    logoUrl: clinic.logoUrl,
    status: clinic.status,
    suspensionSource: clinic.suspensionSource ?? null,
    pastDueSince: clinic.pastDueSince ?? null,
    trialEndsAt: clinic.trialEndsAt,
    onboardingCompletedAt: clinic.onboardingCompletedAt,
    createdAt: clinic.createdAt,
    updatedAt: clinic.updatedAt,
    owners,
    staffCounts: {
      total: totalStaff,
      doctor: doctorCount,
      receptionist: receptionistCount,
      owner: ownerCount,
    },
    patientCount,
    appointmentCount,
    subscriptionSummary,
  };
}

export interface UpdateClinicStatusPatch {
  suspensionSource?: Clinic['suspensionSource'];
  pastDueSince?: Date | null;
}

export async function updateClinicStatus(
  clinicId: string,
  status: ClinicStatus,
  patch: UpdateClinicStatusPatch = {},
  tx: DbClient = db,
): Promise<Clinic> {
  const setPayload: Partial<Clinic> = {
    status,
    updatedAt: new Date(),
    ...(patch && 'suspensionSource' in patch ? { suspensionSource: patch.suspensionSource } : {}),
    ...(patch && 'pastDueSince' in patch ? { pastDueSince: patch.pastDueSince } : {}),
  };

  const [updated] = await tx
    .update(clinics)
    .set(setPayload)
    .where(eq(clinics.id, clinicId))
    .returning();

  return updated;
}

export async function updateClinicTrialEndsAt(
  clinicId: string,
  trialEndsAt: Date,
  tx: DbClient = db,
): Promise<Clinic> {
  const [updated] = await tx
    .update(clinics)
    .set({ trialEndsAt, updatedAt: new Date() })
    .where(eq(clinics.id, clinicId))
    .returning();

  return updated;
}
