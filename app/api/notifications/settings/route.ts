import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiSuccess, apiError } from '@/lib/api/respond';
import { updateNotificationSettingsSchema } from '@/modules/notifications/notification.validation';
import { getNotificationSettings, updateNotificationSettings } from '@/modules/notifications';

export async function GET() {
  try {
    const ctx = await getRequestContext();
    const settings = await getNotificationSettings(ctx);
    return apiSuccess({ settings });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getRequestContext();
    const body = updateNotificationSettingsSchema.parse(await request.json());
    const settings = await updateNotificationSettings(ctx, body);
    return apiSuccess({ settings });
  } catch (error) {
    return apiError(error);
  }
}
