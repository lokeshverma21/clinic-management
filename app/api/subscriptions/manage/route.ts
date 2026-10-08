import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiError, apiSuccess } from '@/lib/api/respond';
import { manageSubscriptionSchema } from '@/modules/subscriptions/subscriptions.validation';
import { subscriptionsService } from '@/modules/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const ctx = await getRequestContext();
    const { action } = manageSubscriptionSchema.parse(await request.json());
    const subscription = await subscriptionsService.manageSubscription(ctx.clinicId, ctx, action);
    return apiSuccess({ subscription });
  } catch (error) {
    return apiError(error);
  }
}
