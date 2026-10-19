// /app/api/patients/[id]/appointments/route.ts
import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiSuccess, apiError } from '@/lib/api/respond';
import { listAppointmentsForPatient } from '@/modules/appointments';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/patients/:id/appointments — Auth: required, any role within the clinic.
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    const appointments = await listAppointmentsForPatient(ctx, id);
    return apiSuccess({ appointments });
  } catch (error) {
    return apiError(error);
  }
}
