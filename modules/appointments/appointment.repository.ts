// src/modules/appointments/appointment.repository.ts
import { and, eq, gt, lt, ne, isNull, or } from 'drizzle-orm';
import { db } from '@/db/client';
import { appointments, memberships, patients, users } from '@/db/schema';
import type { NewAppointment, Appointment } from '@/db/schema';
import type { AppointmentWithDetails } from './appointment.types';

/**
 * Thrown when the database's EXCLUDE constraint (Part 6) rejects an
 * insert/update — meaning the application-level overlap check below lost
 * a race to a concurrent request. This is the backstop working as
 * designed (Part 8's defense-in-depth), not an unexpected failure.
 */
export class SlotConflictDbError extends Error {}

function isExclusionViolation(error: unknown): boolean {
  // Postgres error code 23P01 = exclusion_violation
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === '23P01';
}

export async function listAppointments(
  clinicId: string,
  filters: { from: Date; to: Date; doctorMembershipId?: string; status?: Appointment['status'] },
): Promise<AppointmentWithDetails[]> {
  const conditions = [
    eq(appointments.clinicId, clinicId),
    isNull(appointments.deletedAt),
    // Overlap semantics, not a naive "startTime between" — catches
    // appointments that span into or out of the requested range.
    lt(appointments.startTime, filters.to),
    gt(appointments.endTime, filters.from),
  ];

  if (filters.doctorMembershipId) {
    conditions.push(eq(appointments.doctorMembershipId, filters.doctorMembershipId));
  }
  if (filters.status) {
    conditions.push(eq(appointments.status, filters.status));
  }

  const rows = await db
    .select({
      appointment: appointments,
      patient: {
        id: patients.id,
        fullName: patients.fullName,
        phone: patients.phone,
        email: patients.email,
      },
      doctor: {
        membershipId: memberships.id,
        fullName: users.fullName,
        email: users.email,
      },
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(memberships, eq(appointments.doctorMembershipId, memberships.id))
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(and(...conditions))
    .orderBy(appointments.startTime);

  return rows.map((row) => ({
    ...row.appointment,
    patient: {
      id: row.patient.id,
      fullName: row.patient.fullName,
      phone: row.patient.phone,
      email: row.patient.email,
    },
    doctor: {
      membershipId: row.doctor.membershipId,
      fullName: row.doctor.fullName,
      email: row.doctor.email,
    },
  }));
}

export async function getAppointmentById(clinicId: string, appointmentId: string): Promise<Appointment | null> {
  const [appointment] = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.clinicId, clinicId), eq(appointments.id, appointmentId), isNull(appointments.deletedAt)))
    .limit(1);
  return appointment ?? null;
}

/**
 * Supports the Staff module's deactivation warning (Part 9 edge case:
 * "this doctor has N upcoming appointments — reassign or cancel them
 * first"). Counts future, non-canceled, non-completed appointments only.
 */
export async function countUpcomingAppointmentsForDoctor(
  clinicId: string,
  doctorMembershipId: string,
): Promise<number> {
  const rows = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(
      and(
        eq(appointments.clinicId, clinicId),
        eq(appointments.doctorMembershipId, doctorMembershipId),
        gt(appointments.startTime, new Date()),
        ne(appointments.status, 'canceled'),
        ne(appointments.status, 'completed'),
        isNull(appointments.deletedAt),
      ),
    );
  return rows.length;
}

/**
 * Validates that `membershipId` is an active doctor at this clinic — Part
 * 9's "doctor must have an active membership at this clinic" rule.
 */
export async function getActiveDoctorMembership(clinicId: string, membershipId: string) {
  const [membership] = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.id, membershipId),
        eq(memberships.clinicId, clinicId),
        or(
          eq(memberships.role, "doctor"),
          eq(memberships.role, "owner"),
        ),
        eq(memberships.status, 'active'),
      ),
    )
    .limit(1);
  return membership ?? null;
}

/**
 * Application-level slot check — the database exclusion constraint is
 * the hard backstop (Part 6), this is what lets the service return a
 * clean 409 SLOT_UNAVAILABLE instead of surfacing a raw DB error most of
 * the time. `excludeAppointmentId` lets a reschedule check against every
 * *other* appointment without conflicting with itself.
 */
export async function findOverlappingAppointments(
  clinicId: string,
  doctorMembershipId: string,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId?: string,
): Promise<Appointment[]> {
  const conditions = [
    eq(appointments.clinicId, clinicId),
    eq(appointments.doctorMembershipId, doctorMembershipId),
    ne(appointments.status, 'canceled'),
    isNull(appointments.deletedAt),
    lt(appointments.startTime, endTime),
    gt(appointments.endTime, startTime),
  ];

  if (excludeAppointmentId) {
    conditions.push(ne(appointments.id, excludeAppointmentId));
  }

  return db.select().from(appointments).where(and(...conditions));
}

export async function insertAppointment(
  clinicId: string,
  input: Omit<NewAppointment, 'clinicId'>,
): Promise<Appointment> {
  try {
    const [appointment] = await db
      .insert(appointments)
      .values({ ...input, clinicId })
      .returning();
    return appointment;
  } catch (error) {
    if (isExclusionViolation(error)) {
      throw new SlotConflictDbError('Doctor already has an overlapping appointment');
    }
    throw error;
  }
}

export async function updateAppointment(
  clinicId: string,
  appointmentId: string,
  patch: Partial<Omit<NewAppointment, 'clinicId'>>,
): Promise<Appointment | null> {
  try {
    const [appointment] = await db
      .update(appointments)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(appointments.clinicId, clinicId), eq(appointments.id, appointmentId), isNull(appointments.deletedAt)))
      .returning();
    return appointment ?? null;
  } catch (error) {
    if (isExclusionViolation(error)) {
      throw new SlotConflictDbError('Doctor already has an overlapping appointment');
    }
    throw error;
  }
}