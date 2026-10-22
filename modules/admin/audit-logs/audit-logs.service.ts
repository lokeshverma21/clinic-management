// modules/admin/audit-logs/audit-logs.service.ts
import 'server-only';

import { assertCanWrite, type PlatformContext } from '@/modules/admin/access';
import type { PlatformAuditLog } from '@/db/schema';
import {
  insertPlatformAuditLog,
  listPlatformAuditLogs,
  type DbClient,
} from './audit-logs.repository';
import type {
  RecordAdminActionInput,
  ListAuditLogsFilters,
  ListAuditLogsResult,
} from './audit-logs.types';

/**
 * Records an administrative action in the platform audit log.
 *
 * Designed to be called by OTHER admin domain services inside their own write
 * flow, optionally participating in an existing database transaction via `tx`.
 *
 * NOTE ON METADATA:
 * The `metadata` payload must be kept minimal and lightweight. It must NEVER contain:
 * - Credentials, authentication secrets, tokens, or passwords
 * - Protected Health Information (PHI) or patient-identifiable data
 * - Full entity snapshots that could bloat log storage
 * Only store coarse-grained change summaries, modified field names, or IDs.
 */
export async function recordAdminAction(
  ctx: PlatformContext,
  input: RecordAdminActionInput,
  tx?: DbClient,
): Promise<PlatformAuditLog> {
  assertCanWrite(ctx);

  return insertPlatformAuditLog(
    {
      actorPlatformUserId: ctx.platformUserId,
      actorEmail: ctx.email,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      clinicId: input.clinicId ?? null,
      metadata: input.metadata ?? null,
    },
    tx,
  );
}

/**
 * Lists platform audit log records with optional filters and pagination.
 *
 * Access rule: Permitted for both `super_admin` and `support` platform roles.
 */
export async function listAuditLogs(
  ctx: PlatformContext,
  filters: ListAuditLogsFilters,
): Promise<ListAuditLogsResult> {
  // Both super_admin and support roles are authorized to view platform audit logs.
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;

  const { rows, total } = await listPlatformAuditLogs({
    ...filters,
    page,
    pageSize,
  });

  return {
    logs: rows,
    total,
    page,
    pageSize,
  };
}
