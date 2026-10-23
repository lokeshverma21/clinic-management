// app/api/admin/subscriptions/[clinicId]/route.ts
import type { NextRequest } from 'next/server';
import { getPlatformContext } from '@/modules/admin/access';
import { getSubscriptionDetail } from '@/modules/admin/subscriptions';
import { clinicIdParamSchema } from '@/modules/admin/subscriptions/subscriptions.validation';
import { apiSuccess, apiError } from '@/lib/api/respond';

interface RouteContext {
  params: Promise<{ clinicId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const ctx = await getPlatformContext();
    const rawParams = await params;
    const { clinicId } = clinicIdParamSchema.parse(rawParams);
    const result = await getSubscriptionDetail(ctx, clinicId);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
