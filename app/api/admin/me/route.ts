import { getPlatformContext } from '@/modules/admin/access';
import { apiSuccess, apiError } from '@/lib/api/respond';

/**
 * GET /api/admin/me
 *
 * Platform Admin Identity Verification Endpoint.
 * Resolves and returns the authenticated platform administrator's context.
 * Serves as the template and baseline guard check for platform admin API routes.
 */
export async function GET() {
  try {
    const ctx = await getPlatformContext();
    return apiSuccess({ admin: ctx });
  } catch (error) {
    return apiError(error);
  }
}
