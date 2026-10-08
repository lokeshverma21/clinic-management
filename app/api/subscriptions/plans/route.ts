import { subscriptionsService } from '@/modules/subscriptions';
import { apiSuccess } from '@/lib/api/respond';

export async function GET() {
  const plans = subscriptionsService.getSubscriptionPlans();
  return apiSuccess({ plans });
}
