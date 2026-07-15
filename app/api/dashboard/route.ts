// /app/api/dashboard/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiSuccess, apiError } from '@/lib/api/respond';
import { getDashboard } from '@/modules/dashboard';

/**
 * GET /api/dashboard
 *
 * Returns the full dashboard payload in a single HTTP response.
 * No query parameters. No request body. Authenticated users only.
 *
 * The service fires all repository queries in parallel, so response time
 * is bounded by the slowest single database query, not their sum.
 *
 * Authentication and clinic-scoping are enforced by getRequestContext()
 * — the route handler never touches clinicId or userId directly.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await getRequestContext();
    const data = await getDashboard(ctx);
    return apiSuccess(data);
  } catch (error) {
    return apiError(error);
  }
}