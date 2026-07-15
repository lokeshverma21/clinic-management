// /modules/dashboard/dashboard.types.ts

/**
 * Dashboard types are aggregation-only read models.
 *
 * These are NOT Drizzle schema types re-exported verbatim — they are
 * purpose-built shapes assembled from multiple underlying tables by the
 * repository layer. The dashboard never writes; it owns no rows; it has
 * no FK constraints of its own.
 *
 * Every field must be derivable from a real column in the actual schema.
 * No invented metrics. No computed percentages with no semantic meaning.
 */

// ---------------------------------------------------------------------------
// Appointment status
// ---------------------------------------------------------------------------

/**
 * Must stay in sync with the appointmentStatusEnum in @/db/schema/enums.
 * Defined here as a union so dashboard consumers don't need to import
 * the raw Drizzle enum object.
 */
export type AppointmentStatus = 'booked' | 'confirmed' | 'completed' | 'canceled' | 'no_show';

// ---------------------------------------------------------------------------
// Appointment shape
// ---------------------------------------------------------------------------

export interface DashboardAppointment {
  /** Primary key of the appointments row. */
  id: string;
  /** ISO datetime string from appointments.startTime (stored with timezone). */
  startTime: string;
  /** ISO datetime string from appointments.endTime (stored with timezone). */
  endTime: string;
  /**
   * Duration in minutes derived from (endTime - startTime).
   * Computed in the repository so the UI never needs to do Date arithmetic.
   */
  durationMinutes: number;
  status: AppointmentStatus;
  /** Free-text notes from appointments.notes — may be null. */
  notes: string | null;
  /** FK to patients.id */
  patientId: string;
  /** Joined from patients.fullName */
  patientName: string;
  /**
   * FK to memberships.id — the doctor's membership at this clinic.
   * Not the user ID; the membership ID is what the rest of the app uses
   * to identify a doctor-at-clinic.
   */
  doctorMembershipId: string;
  /**
   * Joined via appointments.doctorMembershipId → memberships.userId
   * → users.fullName. This is the human-readable display name.
   */
  doctorName: string;
}

// ---------------------------------------------------------------------------
// Patient shape
// ---------------------------------------------------------------------------

export interface DashboardPatient {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  /** ISO date string as stored in patients.dateOfBirth (date column, no time). */
  dateOfBirth: string | null;
  /** ISO datetime from patients.createdAt — used to order "recent". */
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Doctor shape
// ---------------------------------------------------------------------------

/**
 * A doctor on the dashboard is a membership row with role = 'doctor',
 * enriched with the user's name and email from the users table.
 *
 * "Working today" = has at least one non-cancelled appointment whose
 * startTime falls within today's UTC bounds.
 *
 * appointmentCountToday comes from COUNT(appointments.id) grouped by
 * membership — computed in one query, not N separate queries.
 */
export interface DashboardDoctor {
  /** memberships.id */
  membershipId: string;
  /** users.fullName joined via memberships.userId */
  fullName: string;
  /** users.email joined via memberships.userId */
  email: string;
  /** staffProfiles.specialization — null if no profile row exists. */
  specialization: string | null;
  /** COUNT(appointments.id) for today, derived in the GROUP BY query. */
  appointmentCountToday: number;
}

// ---------------------------------------------------------------------------
// Stats / counters
// ---------------------------------------------------------------------------

/**
 * Every counter maps to a COUNT aggregate on a real column.
 * No invented KPIs.
 */
export interface DashboardStats {
  /** COUNT of appointments where startTime falls within today AND clinicId matches. */
  appointmentsToday: number;
  /** COUNT of appointments where status = 'completed' AND startTime is today. */
  completedToday: number;
  /** COUNT of patients where deletedAt IS NULL AND clinicId matches. */
  totalPatients: number;
  /**
   * COUNT DISTINCT of doctorMembershipId values in today's non-cancelled
   * appointments — i.e. how many distinct doctors are working today.
   */
  doctorsWorkingToday: number;
}

// ---------------------------------------------------------------------------
// Clinic summary
// ---------------------------------------------------------------------------

/**
 * Only columns that actually exist on the clinics and subscriptions tables.
 * clinics has no email column — that field has been removed.
 */
export interface DashboardClinic {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  timezone: string;
  logoUrl: string | null;
  /** clinics.status — e.g. 'trial' | 'active' | 'suspended' */
  clinicStatus: string;
  /** subscriptions.status — null if no subscription row exists yet. */
  subscriptionStatus: string | null;
  /** subscriptions.plan — null if no subscription row exists yet. */
  subscriptionPlan: string | null;
  /** subscriptions.currentPeriodEnd — null if no subscription row exists yet. */
  subscriptionPeriodEnd: string | null;
}

// ---------------------------------------------------------------------------
// Top-level response
// ---------------------------------------------------------------------------

/**
 * Single object returned by GET /api/dashboard.
 * Wrapped in apiSuccess() by the route handler.
 */
export interface DashboardResponse {
  stats: DashboardStats;
  /**
   * All appointments whose startTime falls within today (UTC bounds),
   * ordered by startTime ASC. Includes all statuses — staff need the full
   * picture of the day, not just upcoming slots.
   */
  todayAppointments: DashboardAppointment[];
  /**
   * Next appointments after the current moment, status !== 'canceled',
   * capped at 10. Forward-looking view beyond what is already on today's
   * schedule.
   */
  upcomingAppointments: DashboardAppointment[];
  /**
   * Most recently created patients (createdAt DESC), limited to 8.
   * Gives staff quick access to patients added this week.
   */
  recentPatients: DashboardPatient[];
  /**
   * Doctors (membership.role = 'doctor') with at least one appointment
   * today, with their count for the day.
   */
  doctorsWorkingToday: DashboardDoctor[];
  clinic: DashboardClinic;
}