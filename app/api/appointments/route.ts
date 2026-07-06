// src/app/api/appointments/route.ts
import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiSuccess, apiError } from '@/lib/api/respond';
import { listAppointmentsQuerySchema, createAppointmentSchema } from '@/modules/appointments/appointment.validation';
import { listAppointments, createAppointment } from '@/modules/appointments';

// GET /api/appointments?from=&to=&doctorId=&status=
// Auth: required, any role — doctors are auto-scoped to their own schedule.
export async function GET(request: NextRequest) {
  try {
    const ctx = await getRequestContext();
    const query = listAppointmentsQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await listAppointments(ctx, query);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}

// POST /api/appointments — { patientId, doctorMembershipId, startTime, endTime, notes? }
// Auth: owner, receptionist (any doctor); doctor (self only).
export async function POST(request: NextRequest) {
  try {
    const ctx = await getRequestContext();
    const body = createAppointmentSchema.parse(await request.json());
    const appointment = await createAppointment(ctx, body);
    return apiSuccess({ appointment }, 201);
  } catch (error) {
    return apiError(error);
  }
}