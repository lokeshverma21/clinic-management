// app/api/admin/clinics/[clinicId]/suspend/route.ts
import type { NextRequest } from 'next/server';
import { getPlatformContext } from '@/modules/admin/access';
import { suspendClinic } from '@/modules/admin/clinics';
import {
  clinicIdParamSchema,
  suspendClinicSchema,
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
    const body = suspendClinicSchema.parse(await request.json());
    const updated = await suspendClinic(ctx, clinicId, body);
    return apiSuccess({ clinic: updated });
  } catch (error) {
    return apiError(error);
  }
}
