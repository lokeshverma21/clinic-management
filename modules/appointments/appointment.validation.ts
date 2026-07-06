//  # Input validation schemas
// modules/appointments/appointment.validation.ts
import { z } from 'zod';

const isoDateTime = z.string().datetime({ message: 'Must be an ISO 8601 datetime' });
const isoDate = z.string().date();
const appointmentStatusSchema = z.enum(['booked', 'confirmed', 'completed', 'canceled', 'no_show']);

export const createAppointmentSchema = z
  .object({
    patientId: z.string().uuid(),
    doctorMembershipId: z.string().uuid(),
    startTime: isoDateTime,
    endTime: isoDateTime,
    notes: z.string().trim().max(2000).optional(),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  })
  .refine((data) => new Date(data.startTime) > new Date(), {
    message: 'startTime must be in the future',
    path: ['startTime'],
  });

export const updateAppointmentSchema = z
  .object({
    startTime: isoDateTime.optional(),
    endTime: isoDateTime.optional(),
    status: appointmentStatusSchema.optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
  })
  .refine((data) => !(data.startTime && data.endTime) || new Date(data.endTime) > new Date(data.startTime), {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  });

// `from`/`to` ordering (Part 12's INVALID_DATE_RANGE) is checked in the
// service layer with its own error code, not here — Zod only checks
// format so a bad range fails with the documented code, not a generic one.
export const listAppointmentsQuerySchema = z.object({
  from: isoDate,
  to: isoDate,
  doctorId: z.string().uuid().optional(),
  status: appointmentStatusSchema.optional(),
});

export type CreateAppointmentSchema = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentSchema = z.infer<typeof updateAppointmentSchema>;
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;