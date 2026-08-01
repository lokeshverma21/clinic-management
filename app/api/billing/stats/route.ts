// app/api/billing/stats/route.ts
import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiSuccess, apiError } from '@/lib/api/respond';
import { getBillingStats } from '@/modules/billing';

export async function GET(_request: NextRequest) {
  try {
    const ctx = await getRequestContext();
    const stats = await getBillingStats(ctx);
    return apiSuccess({ stats });
  } catch (error) {
    return apiError(error);
  }
}
