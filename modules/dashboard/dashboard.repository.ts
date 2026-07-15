// /modules/dashboard/dashboard.repository.ts
import {
  and,
  count,
  countDistinct,
  desc,
  eq,
  gt,
  gte,
  isNull,
  lte,
  ne,
  sql,
} from 'drizzle-orm';
import { db } from '@/db/client';
import {
  appointments,
  clinics,
  memberships,
  patients,
  staffProfiles,
  subscriptions,
  users,
} from '@/db/schema';
import type {
  DashboardAppointment,
  DashboardClinic,
  DashboardDoctor,
  DashboardPatient,
  DashboardStats,
} from './dashboard.types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns the inclusive UTC start (00:00:00.000) and inclusive UTC end
 * (23:59:59.999) of the current calendar day as Date objects.
 *
 * Computed once per repository call and passed explicitly into every
 * sub-query that needs it — avoids `new Date()` drift across the
 * Promise.all fan-out when a request straddles a UTC midnight boundary.
 */
function getTodayBounds(): { start: Date; end: Date } {
  const now = new Date();

  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Converts the raw integer returned by Drizzle's count() helper to a
 * plain JavaScript number. Drizzle types count() as `number` but the
 * underlying pg driver may return a string for very large counts; this
 * guard keeps the type honest without lying about it.
 */
function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Maps a raw appointments row + joined names into a DashboardAppointment.
 * Extracted once so both getTodayAppointments and getUpcomingAppointments
 * use the identical mapping logic — no duplication, no drift.
 */
function mapAppointmentRow(row: {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  notes: string | null;
  patientId: string;
  patientName: string;
  doctorMembershipId: string;
  doctorName: string;
}): DashboardAppointment {
  const durationMs = row.endTime.getTime() - row.startTime.getTime();
  const durationMinutes = Math.round(durationMs / 60_000);

  return {
    id: row.id,
    startTime: row.startTime.toISOString(),
    endTime: row.endTime.toISOString(),
    durationMinutes,
    status: row.status as DashboardAppointment['status'],
    notes: row.notes,
    patientId: row.patientId,
    patientName: row.patientName,
    doctorMembershipId: row.doctorMembershipId,
    doctorName: row.doctorName,
  };
}

// ---------------------------------------------------------------------------
// getDashboardStats
// ---------------------------------------------------------------------------

/**
 * Four independent scalar aggregates fired in parallel via Promise.all.
 *
 * Each is a plain COUNT with a WHERE clause — no joins, no subqueries.
 * They are independent of each other, so there is no reason to await
 * them sequentially; the total latency is bounded by the slowest of the
 * four, not their sum.
 */
export async function getDashboardStats(clinicId: string): Promise<DashboardStats> {
  const { start, end } = getTodayBounds();

  const [
    appointmentsTodayRows,
    completedTodayRows,
    totalPatientsRows,
    doctorsWorkingTodayRows,
  ] = await Promise.all([
    // All appointments whose startTime falls within today
    db
      .select({ value: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.clinicId, clinicId),
          isNull(appointments.deletedAt),
          gte(appointments.startTime, start),
          lte(appointments.startTime, end),
        ),
      ),

    // Completed appointments today
    db
      .select({ value: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.clinicId, clinicId),
          isNull(appointments.deletedAt),
          eq(appointments.status, 'completed'),
          gte(appointments.startTime, start),
          lte(appointments.startTime, end),
        ),
      ),

    // Active (non-soft-deleted) patients for this clinic
    db
      .select({ value: count() })
      .from(patients)
      .where(
        and(
          eq(patients.clinicId, clinicId),
          isNull(patients.deletedAt),
        ),
      ),

    // Distinct doctors with at least one non-cancelled appointment today
    db
      .select({ value: countDistinct(appointments.doctorMembershipId) })
      .from(appointments)
      .where(
        and(
          eq(appointments.clinicId, clinicId),
          isNull(appointments.deletedAt),
          ne(appointments.status, 'canceled'),
          gte(appointments.startTime, start),
          lte(appointments.startTime, end),
        ),
      ),
  ]);

  return {
    appointmentsToday: toNumber(appointmentsTodayRows[0]?.value),
    completedToday: toNumber(completedTodayRows[0]?.value),
    totalPatients: toNumber(totalPatientsRows[0]?.value),
    doctorsWorkingToday: toNumber(doctorsWorkingTodayRows[0]?.value),
  };
}

// ---------------------------------------------------------------------------
// Shared appointment select shape
// ---------------------------------------------------------------------------

/**
 * The join path to reach a doctor's display name:
 *   appointments.doctorMembershipId
 *     → memberships.id
 *     → memberships.userId
 *     → users.id
 *     → users.fullName
 *
 * This is a two-step join (appointments → memberships → users).
 * Both innerJoins are required; neither is optional.
 */
const appointmentSelectShape = {
  id: appointments.id,
  startTime: appointments.startTime,
  endTime: appointments.endTime,
  status: appointments.status,
  notes: appointments.notes,
  patientId: appointments.patientId,
  patientName: patients.fullName,
  doctorMembershipId: appointments.doctorMembershipId,
  doctorName: users.fullName,
} as const;

// ---------------------------------------------------------------------------
// getTodayAppointments
// ---------------------------------------------------------------------------

/**
 * All appointments for today ordered chronologically.
 *
 * Includes every status so staff see the complete picture of the day —
 * a cancelled slot is still operationally relevant (it freed up a gap).
 *
 * No pagination: a clinic with more than 200 appointments in one day is
 * an extreme edge case; loading them all at once is correct at this scale.
 */
export async function getTodayAppointments(clinicId: string): Promise<DashboardAppointment[]> {
  const { start, end } = getTodayBounds();

  const rows = await db
    .select(appointmentSelectShape)
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(memberships, eq(appointments.doctorMembershipId, memberships.id))
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(
      and(
        eq(appointments.clinicId, clinicId),
        isNull(appointments.deletedAt),
        gte(appointments.startTime, start),
        lte(appointments.startTime, end),
      ),
    )
    .orderBy(appointments.startTime);

  return rows.map(mapAppointmentRow);
}

// ---------------------------------------------------------------------------
// getUpcomingAppointments
// ---------------------------------------------------------------------------

/**
 * Next N appointments after the current moment, excluding cancelled ones.
 *
 * "After the current moment" uses `gt(appointments.startTime, now)` so an
 * appointment that started 10 minutes ago is no longer "upcoming" — it
 * has begun and belongs in the today schedule view instead.
 *
 * Default limit of 10 is intentional: the dashboard sidebar is not a
 * full appointment list; it is a glance ahead.
 */
export async function getUpcomingAppointments(
  clinicId: string,
  limit = 10,
): Promise<DashboardAppointment[]> {
  const now = new Date();

  const rows = await db
    .select(appointmentSelectShape)
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(memberships, eq(appointments.doctorMembershipId, memberships.id))
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(
      and(
        eq(appointments.clinicId, clinicId),
        isNull(appointments.deletedAt),
        gt(appointments.startTime, now),
        ne(appointments.status, 'canceled'),
      ),
    )
    .orderBy(appointments.startTime)
    .limit(limit);

  return rows.map(mapAppointmentRow);
}

// ---------------------------------------------------------------------------
// getRecentPatients
// ---------------------------------------------------------------------------

/**
 * Most recently registered patients, ordered by createdAt DESC.
 * Soft-deleted patients are excluded.
 * Capped at 8 — this is a "recent additions" glance, not a full list.
 */
export async function getRecentPatients(
  clinicId: string,
  limit = 8,
): Promise<DashboardPatient[]> {
  const rows = await db
    .select({
      id: patients.id,
      fullName: patients.fullName,
      phone: patients.phone,
      email: patients.email,
      dateOfBirth: patients.dateOfBirth,
      createdAt: patients.createdAt,
    })
    .from(patients)
    .where(
      and(
        eq(patients.clinicId, clinicId),
        isNull(patients.deletedAt),
      ),
    )
    .orderBy(desc(patients.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    fullName: row.fullName,
    phone: row.phone,
    email: row.email,
    /**
     * patients.dateOfBirth is a Drizzle `date` column — the pg driver
     * returns it as a string in 'YYYY-MM-DD' format, not a Date object.
     * We pass it through as-is; no conversion needed.
     */
    dateOfBirth: row.dateOfBirth,
    createdAt: row.createdAt.toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// getDoctorsWorkingToday
// ---------------------------------------------------------------------------

/**
 * Doctors who have at least one non-cancelled appointment today,
 * with their appointment count for the day.
 *
 * Join path:
 *   appointments → memberships (doctorMembershipId = memberships.id)
 *               → users        (memberships.userId = users.id)
 *               → staffProfiles (memberships.id = staffProfiles.membershipId)
 *
 * staffProfiles is LEFT joined because a doctor membership may not yet
 * have a staff profile row — the dashboard must not silently drop that
 * doctor just because their profile is incomplete.
 *
 * GROUP BY fires on the full set of identifying columns so Postgres can
 * satisfy the aggregate without a subquery.
 */
export async function getDoctorsWorkingToday(clinicId: string): Promise<DashboardDoctor[]> {
  const { start, end } = getTodayBounds();

  const rows = await db
    .select({
      membershipId: memberships.id,
      fullName: users.fullName,
      email: users.email,
      specialization: staffProfiles.specialization,
      appointmentCountToday: count(appointments.id),
    })
    .from(appointments)
    .innerJoin(memberships, eq(appointments.doctorMembershipId, memberships.id))
    .innerJoin(users, eq(memberships.userId, users.id))
    .leftJoin(staffProfiles, eq(staffProfiles.membershipId, memberships.id))
    .where(
      and(
        eq(appointments.clinicId, clinicId),
        isNull(appointments.deletedAt),
        ne(appointments.status, 'canceled'),
        gte(appointments.startTime, start),
        lte(appointments.startTime, end),
      ),
    )
    .groupBy(
      memberships.id,
      users.fullName,
      users.email,
      staffProfiles.specialization,
    )
    .orderBy(users.fullName);

  return rows.map((row) => ({
    membershipId: row.membershipId,
    fullName: row.fullName,
    email: row.email,
    specialization: row.specialization,
    appointmentCountToday: toNumber(row.appointmentCountToday),
  }));
}

// ---------------------------------------------------------------------------
// getClinicSummary
// ---------------------------------------------------------------------------

/**
 * Fetches the clinic row and LEFT joins its subscription.
 *
 * LEFT join because a clinic may exist without a subscription row (e.g.
 * during the onboarding flow before a plan is selected). The subscription
 * fields come back as null in that case — which is a valid, expected state.
 *
 * clinics.status is the platform-level clinic status ('trial', 'active',
 * 'suspended') — distinct from subscriptions.status which is the billing
 * status ('trialing', 'active', 'past_due', etc.). Both are surfaced so
 * the UI can make informed decisions about what to show staff.
 */
export async function getClinicSummary(clinicId: string): Promise<DashboardClinic | null> {
  const [row] = await db
    .select({
      id: clinics.id,
      name: clinics.name,
      slug: clinics.slug,
      address: clinics.address,
      phone: clinics.phone,
      timezone: clinics.timezone,
      logoUrl: clinics.logoUrl,
      clinicStatus: clinics.status,
      subscriptionStatus: subscriptions.status,
      subscriptionPlan: subscriptions.plan,
      subscriptionPeriodEnd: subscriptions.currentPeriodEnd,
    })
    .from(clinics)
    .leftJoin(subscriptions, eq(subscriptions.clinicId, clinics.id))
    .where(eq(clinics.id, clinicId))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    address: row.address,
    phone: row.phone,
    timezone: row.timezone,
    logoUrl: row.logoUrl,
    clinicStatus: row.clinicStatus,
    subscriptionStatus: row.subscriptionStatus,
    subscriptionPlan: row.subscriptionPlan,
    /**
     * subscriptions.currentPeriodEnd is a timestamp column — the pg driver
     * returns a Date object. Convert to ISO string for the response; the
     * UI formats it as a human-readable date.
     */
    subscriptionPeriodEnd: row.subscriptionPeriodEnd?.toISOString() ?? null,
  };
}