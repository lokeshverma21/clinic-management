// app/api/admin/clinics/[clinicId]/extend-trial/route.ts
import type { NextRequest } from 'next/server';
import { getPlatformContext } from '@/modules/admin/access';
import { extendClinicTrial } from '@/modules/admin/clinics';
import {
  clinicIdParamSchema,
  extendClinicTrialSchema,
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
    const body = extendClinicTrialSchema.parse(await request.json());
    const updated = await extendClinicTrial(ctx, clinicId, body);
    return apiSuccess({ clinic: updated });
  } catch (error) {
    return apiError(error);
  }
}
