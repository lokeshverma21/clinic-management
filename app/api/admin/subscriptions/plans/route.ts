// app/api/admin/subscriptions/plans/route.ts
import { getPlatformContext } from '@/modules/admin/access';
import { listPlans } from '@/modules/admin/subscriptions';
import { apiSuccess, apiError } from '@/lib/api/respond';

export async function GET() {
  try {
    const ctx = await getPlatformContext();
    const result = await listPlans(ctx);
    return apiSuccess({ plans: result });
  } catch (error) {
    return apiError(error);
  }
}
