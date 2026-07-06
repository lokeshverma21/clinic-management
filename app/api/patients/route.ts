// /app/api/patients/route.ts
import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiSuccess, apiError } from '@/lib/api/respond';
import { listPatientsQuerySchema, createPatientSchema } from '@/modules/patients/patients.validation';
import { listPatients, createPatient } from '@/modules/patients';

// GET /api/patients?search=&page=&pageSize=
// Auth: required, any role (Part 12).
export async function GET(request: NextRequest) {
  try {
    const ctx = await getRequestContext();
    const query = listPatientsQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await listPatients(ctx, query);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}

// POST /api/patients — { fullName, phone, email?, dateOfBirth?, gender?, notes? }
// Auth: required, any role (Part 9 — owner/doctor/receptionist can all create).
export async function POST(request: NextRequest) {
  try {
    const ctx = await getRequestContext();
    const body = createPatientSchema.parse(await request.json());
    const result = await createPatient(ctx, body);
    return apiSuccess(result, 201);
  } catch (error) {
    return apiError(error);
  }
}