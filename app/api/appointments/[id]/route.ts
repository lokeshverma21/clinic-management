// src/app/api/appointments/[id]/route.ts
import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiSuccess, apiError } from '@/lib/api/respond';
import { updateAppointmentSchema } from '@/modules/appointments/appointment.validation';
import { updateAppointment, cancelAppointment } from '@/modules/appointments';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/appointments/:id — { startTime?, endTime?, status?, notes? }
// Auth: owner/receptionist (any); doctor (own only).
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    const body = updateAppointmentSchema.parse(await request.json());
    const appointment = await updateAppointment(ctx, id, body);
    return apiSuccess({ appointment });
  } catch (error) {
    return apiError(error);
  }
}

// DELETE /api/appointments/:id — cancel (soft: sets status, row retained)
// Auth: owner/receptionist (any); doctor (own only).
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    const appointment = await cancelAppointment(ctx, id);
    return apiSuccess({ appointment });
  } catch (error) {
    return apiError(error);
  }
}