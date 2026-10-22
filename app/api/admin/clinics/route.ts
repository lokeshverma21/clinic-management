// app/api/admin/clinics/route.ts
import type { NextRequest } from 'next/server';
import { getPlatformContext } from '@/modules/admin/access';
import { listClinics } from '@/modules/admin/clinics';
import { listClinicsQuerySchema } from '@/modules/admin/clinics/clinics.validation';
import { apiSuccess, apiError } from '@/lib/api/respond';

export async function GET(request: NextRequest) {
  try {
    const ctx = await getPlatformContext();
    const query = listClinicsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await listClinics(ctx, query);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
