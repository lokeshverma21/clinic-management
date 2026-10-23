// app/api/admin/subscriptions/route.ts
import type { NextRequest } from 'next/server';
import { getPlatformContext } from '@/modules/admin/access';
import { listSubscriptions, getSubscriptionSummary } from '@/modules/admin/subscriptions';
import { listSubscriptionsQuerySchema } from '@/modules/admin/subscriptions/subscriptions.validation';
import { apiSuccess, apiError } from '@/lib/api/respond';

export async function GET(request: NextRequest) {
  try {
    const ctx = await getPlatformContext();
    const query = listSubscriptionsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const [listResult, summary] = await Promise.all([
      listSubscriptions(ctx, query),
      getSubscriptionSummary(ctx),
    ]);

    return apiSuccess({
      ...listResult,
      summary,
    });
  } catch (error) {
    return apiError(error);
  }
}
