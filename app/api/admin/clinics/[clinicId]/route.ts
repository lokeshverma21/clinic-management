// app/api/admin/clinics/[clinicId]/route.ts
import type { NextRequest } from 'next/server';
import { getPlatformContext } from '@/modules/admin/access';
import { getClinicDetail } from '@/modules/admin/clinics';
import { clinicIdParamSchema } from '@/modules/admin/clinics/clinics.validation';
import { apiSuccess, apiError } from '@/lib/api/respond';

interface RouteContext {
  params: Promise<{ clinicId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const ctx = await getPlatformContext();
    const rawParams = await params;
    const { clinicId } = clinicIdParamSchema.parse(rawParams);
    const result = await getClinicDetail(ctx, clinicId);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
