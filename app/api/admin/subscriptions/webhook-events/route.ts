// app/api/admin/subscriptions/webhook-events/route.ts
import type { NextRequest } from 'next/server';
import { getPlatformContext } from '@/modules/admin/access';
import { listWebhookEvents } from '@/modules/admin/subscriptions';
import { listWebhookEventsQuerySchema } from '@/modules/admin/subscriptions/subscriptions.validation';
import { apiSuccess, apiError } from '@/lib/api/respond';

export async function GET(request: NextRequest) {
  try {
    const ctx = await getPlatformContext();
    const query = listWebhookEventsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await listWebhookEvents(ctx, query);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
