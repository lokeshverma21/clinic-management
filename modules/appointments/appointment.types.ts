// modules/appointments/appointment.types.ts
import type { Appointment } from '@/db/schema';

export type { Appointment };
export type AppointmentStatus = Appointment['status'];

export interface CreateAppointmentInput {
  patientId: string;
  doctorMembershipId: string;
  startTime: string; // ISO 8601 datetime
  endTime: string;
  notes?: string;
}

export interface UpdateAppointmentInput {
  startTime?: string;
  endTime?: string;
  status?: AppointmentStatus;
  notes?: string | null;
}

export interface ListAppointmentsFilters {
  from: string; // ISO date, e.g. '2026-07-06'
  to: string;
  doctorId?: string;
  status?: AppointmentStatus;
}

export interface ListAppointmentsResult {
  appointments: Appointment[];
}