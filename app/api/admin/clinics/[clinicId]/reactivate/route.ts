// app/api/admin/clinics/[clinicId]/reactivate/route.ts
import type { NextRequest } from 'next/server';
import { getPlatformContext } from '@/modules/admin/access';
import { reactivateClinic } from '@/modules/admin/clinics';
import {
  clinicIdParamSchema,
  reactivateClinicSchema,
} from '@/modules/admin/clinics/clinics.validation';
import { apiSuccess, apiError } from '@/lib/api/respond';

interface RouteContext {
  params: Promise<{ clinicId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const ctx = await getPlatformContext();
    const rawParams = await params;
    const { clinicId } = clinicIdParamSchema.parse(rawParams);
    const rawBody = await request.json().catch(() => ({}));
    const body = reactivateClinicSchema.parse(rawBody ?? {});
    const updated = await reactivateClinic(ctx, clinicId, body);
    return apiSuccess({ clinic: updated });
  } catch (error) {
    return apiError(error);
  }
}
