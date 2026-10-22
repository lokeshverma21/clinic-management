// app/api/admin/audit-logs/route.ts
import type { NextRequest } from 'next/server';
import { getPlatformContext } from '@/modules/admin/access';
import { listAuditLogs } from '@/modules/admin/audit-logs';
import { listAuditLogsQuerySchema } from '@/modules/admin/audit-logs/audit-logs.validation';
import { apiSuccess, apiError } from '@/lib/api/respond';

export async function GET(request: NextRequest) {
  try {
    const ctx = await getPlatformContext();
    const query = listAuditLogsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await listAuditLogs(ctx, query);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
