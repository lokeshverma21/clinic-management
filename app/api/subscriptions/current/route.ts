import { getRequestContext } from '@/lib/auth/request-context';
import { apiError, apiSuccess } from '@/lib/api/respond';
import { subscriptionsService } from '@/modules/subscriptions';

export async function GET() {
  try {
    const ctx = await getRequestContext();
    const details = await subscriptionsService.getSubscriptionDetails(ctx.clinicId, ctx);
    return apiSuccess(details);
  } catch (error) {
    return apiError(error);
  }
}
