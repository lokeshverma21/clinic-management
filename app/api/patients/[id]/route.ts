// /app/api/patients/[id]/route.ts
import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiSuccess, apiError } from '@/lib/api/respond';
import { updatePatientSchema } from '@/modules/patients/patients.validation';
import { getPatient, updatePatient, archivePatient } from '@/modules/patients';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/patients/:id — Auth: required, any role.
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    const patient = await getPatient(ctx, id);
    return apiSuccess({ patient });
  } catch (error) {
    return apiError(error);
  }
}

// PATCH /api/patients/:id — Auth: required, any role.
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    const body = updatePatientSchema.parse(await request.json());
    const patient = await updatePatient(ctx, id, body);
    return apiSuccess({ patient });
  } catch (error) {
    return apiError(error);
  }
}

// DELETE /api/patients/:id — soft delete (archive). Auth: owner only (Part 9).
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    const patient = await archivePatient(ctx, id);
    return apiSuccess({ patient });
  } catch (error) {
    return apiError(error);
  }
}