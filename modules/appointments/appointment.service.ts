// src/modules/appointments/appointment.service.ts
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '@/lib/errors/app-error';
import type { RequestContext } from '@/lib/auth/request-context';
import { getPatient } from '@/modules/patients';
import * as appointmentRepository from './appointment.repository';
import { SlotConflictDbError } from './appointment.repository';
import type {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  ListAppointmentsFilters,
  ListAppointmentsResult,
} from './appointment.types';

function assertCanModify(ctx: RequestContext, appointment: Appointment): void {
  // Part 8: doctors get full access to their own appointments, view-only
  // for others' — enforced here, not just hidden in the UI.
  if (ctx.role === 'doctor' && appointment.doctorMembershipId !== ctx.membershipId) {
    throw new ForbiddenError('FORBIDDEN', 'Doctors can only manage their own appointments');
  }
}

export async function listAppointments(
  ctx: RequestContext,
  filters: ListAppointmentsFilters,
): Promise<ListAppointmentsResult> {
  const from = new Date(`${filters.from}T00:00:00.000Z`);
  const to = new Date(`${filters.to}T23:59:59.999Z`);

  if (from > to) {
    throw new BadRequestError('INVALID_DATE_RANGE', '`from` must be before or equal to `to`');
  }

  // Doctors default to their own schedule (Part 8) — this overrides
  // whatever `doctorId` the client sent, so scope can't be widened by
  // editing the querystring.
  const doctorMembershipId = ctx.role === 'doctor' ? ctx.membershipId : filters.doctorId;

  const rows = await appointmentRepository.listAppointments(ctx.clinicId, {
    from,
    to,
    doctorMembershipId,
    status: filters.status,
  });

  return { appointments: rows };
}

export async function createAppointment(
  ctx: RequestContext,
  input: CreateAppointmentInput,
): Promise<Appointment> {
  if (ctx.role === 'doctor' && input.doctorMembershipId !== ctx.membershipId) {
    throw new ForbiddenError('FORBIDDEN', 'Doctors can only book appointments for themselves');
  }

  // Confirms the patient exists and belongs to this clinic — reuses the
  // Patients module's own NotFoundError (Part 5: import from a module's
  // public surface) so the error code matches Part 12 without
  // duplicating patient-lookup logic here.
  await getPatient(ctx, input.patientId);

  const doctor = await appointmentRepository.getActiveDoctorMembership(ctx.clinicId, input.doctorMembershipId);
  if (!doctor) {
    throw new NotFoundError('DOCTOR_NOT_FOUND', 'No active doctor found with that membership at this clinic');
  }

  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);

  const overlapping = await appointmentRepository.findOverlappingAppointments(
    ctx.clinicId,
    input.doctorMembershipId,
    startTime,
    endTime,
  );
  if (overlapping.length > 0) {
    throw new ConflictError('SLOT_UNAVAILABLE', 'This time slot is already booked for this doctor');
  }

  try {
    const appointment = await appointmentRepository.insertAppointment(ctx.clinicId, {
      patientId: input.patientId,
      doctorMembershipId: input.doctorMembershipId,
      startTime,
      endTime,
      notes: input.notes ?? null,
      status: 'booked',
      createdByMembershipId: ctx.membershipId,
    });

    // TODO(notifications module, Part 9/10): schedule confirmation +
    // 24h/1h reminder jobs here once Notifications exists. Booking isn't
    // "done" per the blueprint until this hook is wired up.

    return appointment;
  } catch (error) {
    if (error instanceof SlotConflictDbError) {
      // Application check above passed, but a concurrent request won the
      // race — the DB exclusion constraint caught it (Part 8's
      // defense-in-depth backstop working as intended).
      throw new ConflictError('SLOT_UNAVAILABLE', 'This time slot is already booked for this doctor');
    }
    throw error;
  }
}

export async function updateAppointment(
  ctx: RequestContext,
  appointmentId: string,
  input: UpdateAppointmentInput,
): Promise<Appointment> {
  const existing = await appointmentRepository.getAppointmentById(ctx.clinicId, appointmentId);
  if (!existing) throw new NotFoundError('APPOINTMENT_NOT_FOUND', 'Appointment not found');

  assertCanModify(ctx, existing);

  const startTime = input.startTime ? new Date(input.startTime) : existing.startTime;
  const endTime = input.endTime ? new Date(input.endTime) : existing.endTime;
  const timeChanged = Boolean(input.startTime || input.endTime);

  if (timeChanged) {
    if (endTime <= startTime) {
      throw new BadRequestError('INVALID_DATE_RANGE', 'endTime must be after startTime');
    }

    const overlapping = await appointmentRepository.findOverlappingAppointments(
      ctx.clinicId,
      existing.doctorMembershipId,
      startTime,
      endTime,
      existing.id,
    );
    if (overlapping.length > 0) {
      throw new ConflictError('SLOT_UNAVAILABLE', 'This time slot is already booked for this doctor');
    }
  }

  try {
    const appointment = await appointmentRepository.updateAppointment(ctx.clinicId, appointmentId, {
      ...(input.startTime ? { startTime } : {}),
      ...(input.endTime ? { endTime } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    });
    if (!appointment) throw new NotFoundError('APPOINTMENT_NOT_FOUND', 'Appointment not found');

    // TODO(notifications module, Part 9): if the time changed, cancel the
    // old reminder jobs and schedule new ones against the updated time.

    return appointment;
  } catch (error) {
    if (error instanceof SlotConflictDbError) {
      throw new ConflictError('SLOT_UNAVAILABLE', 'This time slot is already booked for this doctor');
    }
    throw error;
  }
}

/**
 * Used by the Staff module's deactivation warning (Part 9) — kept here,
 * not duplicated, since Appointments owns this table (Part 5's import
 * rule: other modules call this through the public surface, not the
 * repository directly).
 */
export async function countUpcomingAppointmentsForMembership(
  ctx: RequestContext,
  doctorMembershipId: string,
): Promise<number> {
  return appointmentRepository.countUpcomingAppointmentsForDoctor(ctx.clinicId, doctorMembershipId);
}
export async function cancelAppointment(ctx: RequestContext, appointmentId: string): Promise<Appointment> {
  const existing = await appointmentRepository.getAppointmentById(ctx.clinicId, appointmentId);
  if (!existing) throw new NotFoundError('APPOINTMENT_NOT_FOUND', 'Appointment not found');

  assertCanModify(ctx, existing);

  const appointment = await appointmentRepository.updateAppointment(ctx.clinicId, appointmentId, {
    status: 'canceled',
  });
  if (!appointment) throw new NotFoundError('APPOINTMENT_NOT_FOUND', 'Appointment not found');

  // TODO(notifications module, Part 9): cancel this appointment's
  // pending notification jobs — a patient shouldn't get a reminder for a
  // canceled appointment.

  return appointment;
}