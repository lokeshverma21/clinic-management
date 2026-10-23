// app/api/admin/notifications/route.ts
import type { NextRequest } from 'next/server';
import { getPlatformContext } from '@/modules/admin/access';
import { listNotifications, getNotificationSummary } from '@/modules/admin/notifications';
import { listNotificationsQuerySchema } from '@/modules/admin/notifications/notifications.validation';
import { apiSuccess, apiError } from '@/lib/api/respond';

export async function GET(request: NextRequest) {
  try {
    const ctx = await getPlatformContext();
    const query = listNotificationsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    const shouldIncludeSummary = query.includeSummary === true || query.page === 1;

    const [list, summary] = await Promise.all([
      listNotifications(ctx, query),
      shouldIncludeSummary ? getNotificationSummary(ctx) : Promise.resolve(null),
    ]);

    return apiSuccess({
      summary,
      list,
    });
  } catch (error) {
    return apiError(error);
  }
}
