// app/api/admin/dashboard/route.ts
import { getPlatformContext } from '@/modules/admin/access';
import { getAdminDashboard } from '@/modules/admin/dashboard';
import { apiSuccess, apiError } from '@/lib/api/respond';

export async function GET() {
  try {
    const ctx = await getPlatformContext();
    const data = await getAdminDashboard(ctx);
    return apiSuccess(data);
  } catch (error) {
    return apiError(error);
  }
}
