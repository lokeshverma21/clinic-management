// modules/admin/audit-logs/audit-logs.repository.ts
import { and, desc, eq, gte, lte, sql, type SQL } from 'drizzle-orm';
import { db } from '@/db/client';
import { platformAuditLogs, platformUsers, clinics } from '@/db/schema';
import type { PlatformAuditLog, NewPlatformAuditLog } from '@/db/schema';
import { startOfIstDay, endOfIstDay } from '@/lib/time';
import type { ListAuditLogsFilters, AdminAuditLogWithActor } from './audit-logs.types';

/** The Drizzle transaction type — avoids `any` on the `tx` parameter. */
export type DbClient = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Platform Audit Logs Repository
 *
 * NOTE: Functions in this repository are intentionally NOT scoped with `clinicId`
 * as the first parameter. Unlike tenant-level repositories where multi-tenancy
 * requires strict clinic partitioning, platform audit logs are platform-level
 * records that track cross-clinic administrative events, platform configuration changes,
 * and support operations across the entire SaaS platform.
 */

export async function insertPlatformAuditLog(
  input: NewPlatformAuditLog,
  tx: DbClient = db,
): Promise<PlatformAuditLog> {
  const [created] = await tx
    .insert(platformAuditLogs)
    .values(input)
    .returning();

  return created;
}

export async function listPlatformAuditLogs(
  filters: ListAuditLogsFilters,
): Promise<{ rows: AdminAuditLogWithActor[]; total: number }> {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
  const offset = (page - 1) * pageSize;

  const conditions: SQL[] = [];

  if (filters.clinicId) {
    conditions.push(eq(platformAuditLogs.clinicId, filters.clinicId));
  }

  if (filters.action) {
    conditions.push(eq(platformAuditLogs.action, filters.action));
  }

  if (filters.actorPlatformUserId) {
    conditions.push(eq(platformAuditLogs.actorPlatformUserId, filters.actorPlatformUserId));
  }

  if (filters.from) {
    const fromDate = filters.from.includes('T') ? new Date(filters.from) : startOfIstDay(filters.from);
    if (!isNaN(fromDate.getTime())) {
      conditions.push(gte(platformAuditLogs.createdAt, fromDate));
    }
  }

  if (filters.to) {
    const toDate = filters.to.includes('T') ? new Date(filters.to) : endOfIstDay(filters.to);
    if (!isNaN(toDate.getTime())) {
      conditions.push(lte(platformAuditLogs.createdAt, toDate));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rawRows = await db
    .select({
      log: platformAuditLogs,
      actor: {
        id: platformUsers.id,
        fullName: platformUsers.fullName,
        email: platformUsers.email,
        role: platformUsers.role,
      },
      clinic: {
        id: clinics.id,
        name: clinics.name,
      },
    })
    .from(platformAuditLogs)
    .leftJoin(platformUsers, eq(platformAuditLogs.actorPlatformUserId, platformUsers.id))
    .leftJoin(clinics, eq(platformAuditLogs.clinicId, clinics.id))
    .where(whereClause)
    .orderBy(desc(platformAuditLogs.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(platformAuditLogs)
    .where(whereClause);

  const total = countRow?.count ?? 0;

  const rows: AdminAuditLogWithActor[] = rawRows.map((r) => ({
    ...r.log,
    actor:
      r.actor && r.actor.id
        ? {
            id: r.actor.id,
            fullName: r.actor.fullName,
            email: r.actor.email,
            role: r.actor.role,
          }
        : null,
    clinic:
      r.clinic && r.clinic.id
        ? {
            id: r.clinic.id,
            name: r.clinic.name,
          }
        : null,
  }));

  return { rows, total };
}
