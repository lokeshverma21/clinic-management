// app/api/clinic-profile/route.ts
import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiSuccess, apiError } from '@/lib/api/respond';
import { updateClinicProfileSchema } from '@/modules/clinic-profile/clinic-profile.validation';
import { getClinicProfile, updateClinicProfile } from '@/modules/clinic-profile';

// GET /api/clinic-profile — Auth: required, any role (Part 9: staff can
// see the clinic's own listed phone/address, e.g. to read it out to a patient).
export async function GET() {
  try {
    const ctx = await getRequestContext();
    const clinic = await getClinicProfile(ctx);
    return apiSuccess({ clinic });
  } catch (error) {
    return apiError(error);
  }
}

// PATCH /api/clinic-profile — Auth: owner only.
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getRequestContext();
    const body = updateClinicProfileSchema.parse(await request.json());
    const clinic = await updateClinicProfile(ctx, body);
    return apiSuccess({ clinic });
  } catch (error) {
    return apiError(error);
  }
}