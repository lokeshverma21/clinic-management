// modules/admin/notifications/notifications.repository.ts
import 'server-only';

import { and, desc, eq, gte, isNotNull, lt, lte, ne, sql, type SQL } from 'drizzle-orm';
import { db } from '@/db/client';
import { clinics, notifications } from '@/db/schema';
import { OVERDUE_NOTIFICATION_HOURS } from '@/lib/policy/notification-policy';
import { startOfIstDay, endOfIstDay } from '@/lib/time';
import type {
  ListNotificationsFilters,
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from './notifications.types';

/**
 * Platform Notifications Repository (READ-ONLY)
 *
 * NOTE: Functions in this repository are intentionally NOT scoped with `clinicId`
 * as the first parameter. Unlike tenant-level repositories where multi-tenancy
 * requires strict clinic partitioning, platform notifications monitoring performs
 * cross-tenant observability queries to diagnose delivery problems across the SaaS platform.
 *
 * READ-ONLY & PRIVACY GUARANTEE:
 * This repository contains ZERO write operations.
 * To protect patient confidentiality, this repository strictly queries only the
 * `notifications` and `clinics` tables. It NEVER selects, joins, or references
 * `patients` or `appointments` tables, and NEVER exposes patient names, phone numbers,
 * email addresses, appointment details, or notification bodies.
 */

export interface RawNotificationRow {
  id: string;
  clinicId: string;
  clinicName: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  scheduledFor: Date;
  sentAt: Date | null;
  failureReason: string | null;
}

export interface RawNotificationSummaryData {
  statusCountsLast7Days: Array<{ status: NotificationStatus; count: number }>;
  failedLast24h: number;
  overdueScheduledCount: number;
  readOnlyClinicSkippedLast7Days: number;
  rawFailureReasonsLast7Days: Array<{ reason: string | null; count: number }>;
  countsByChannelLast7Days: Array<{ channel: NotificationChannel; count: number }>;
}

export async function listNotifications(
  filters: ListNotificationsFilters,
): Promise<{ rows: RawNotificationRow[]; total: number }> {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
  const offset = (page - 1) * pageSize;

  const conditions: SQL[] = [];

  if (filters.clinicId) {
    conditions.push(eq(notifications.clinicId, filters.clinicId));
  }

  if (filters.status) {
    conditions.push(eq(notifications.status, filters.status));
  }

  if (filters.channel) {
    conditions.push(eq(notifications.channel, filters.channel));
  }

  if (filters.type) {
    conditions.push(eq(notifications.type, filters.type));
  }

  if (filters.onlyOverdue) {
    const overdueCutoff = new Date(Date.now() - OVERDUE_NOTIFICATION_HOURS * 60 * 60 * 1000);
    conditions.push(
      and(
        eq(notifications.status, 'scheduled'),
        lt(notifications.scheduledFor, overdueCutoff),
      )!,
    );
  }

  if (filters.from) {
    const fromDate = filters.from.includes('T') ? new Date(filters.from) : startOfIstDay(filters.from);
    if (!isNaN(fromDate.getTime())) {
      conditions.push(gte(notifications.scheduledFor, fromDate));
    }
  }

  if (filters.to) {
    const toDate = filters.to.includes('T') ? new Date(filters.to) : endOfIstDay(filters.to);
    if (!isNaN(toDate.getTime())) {
      conditions.push(lte(notifications.scheduledFor, toDate));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rawRows, [countRow]] = await Promise.all([
    db
      .select({
        id: notifications.id,
        clinicId: notifications.clinicId,
        clinicName: clinics.name,
        type: notifications.type,
        channel: notifications.channel,
        status: notifications.status,
        scheduledFor: notifications.scheduledFor,
        sentAt: notifications.sentAt,
        failureReason: notifications.failureReason,
      })
      .from(notifications)
      .innerJoin(clinics, eq(notifications.clinicId, clinics.id))
      .where(whereClause)
      .orderBy(desc(notifications.scheduledFor))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .innerJoin(clinics, eq(notifications.clinicId, clinics.id))
      .where(whereClause),
  ]);

  return {
    rows: rawRows,
    total: countRow?.count ?? 0,
  };
}

export async function getNotificationSummaryData(): Promise<RawNotificationSummaryData> {
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
  const overdueCutoff = new Date(now - OVERDUE_NOTIFICATION_HOURS * 60 * 60 * 1000);

  const [
    statusCountsLast7Days,
    [failed24hRow],
    [overdueScheduledRow],
    [readOnlySkippedRow],
    rawFailureReasonsLast7Days,
    countsByChannelLast7Days,
  ] = await Promise.all([
    // 1. Status distribution in the last 7 days
    db
      .select({
        status: notifications.status,
        count: sql<number>`count(*)::int`,
      })
      .from(notifications)
      .where(gte(notifications.createdAt, sevenDaysAgo))
      .groupBy(notifications.status),

    // 2. Failed in the last 24 hours
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.status, 'failed'), gte(notifications.createdAt, twentyFourHoursAgo))),

    // 3. Overdue scheduled notifications
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(
        and(
          eq(notifications.status, 'scheduled'),
          lt(notifications.scheduledFor, overdueCutoff),
        ),
      ),

    // 4. Read-only clinic skipped in last 7 days
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(
        and(
          eq(notifications.status, 'failed'),
          eq(notifications.failureReason, 'CLINIC_READ_ONLY'),
          gte(notifications.createdAt, sevenDaysAgo),
        ),
      ),

    // 5. Raw failure reasons in last 7 days (excluding CLINIC_READ_ONLY)
    db
      .select({
        reason: notifications.failureReason,
        count: sql<number>`count(*)::int`,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.status, 'failed'),
          isNotNull(notifications.failureReason),
          ne(notifications.failureReason, 'CLINIC_READ_ONLY'),
          gte(notifications.createdAt, sevenDaysAgo),
        ),
      )
      .groupBy(notifications.failureReason),

    // 6. Channel distribution in the last 7 days
    db
      .select({
        channel: notifications.channel,
        count: sql<number>`count(*)::int`,
      })
      .from(notifications)
      .where(gte(notifications.createdAt, sevenDaysAgo))
      .groupBy(notifications.channel),
  ]);

  return {
    statusCountsLast7Days,
    failedLast24h: failed24hRow?.count ?? 0,
    overdueScheduledCount: overdueScheduledRow?.count ?? 0,
    readOnlyClinicSkippedLast7Days: readOnlySkippedRow?.count ?? 0,
    rawFailureReasonsLast7Days,
    countsByChannelLast7Days,
  };
}
