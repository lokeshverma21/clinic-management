// modules/admin/notifications/notifications.service.ts
import 'server-only';

import type { PlatformContext } from '@/modules/admin/access';
import { OVERDUE_NOTIFICATION_HOURS } from '@/lib/policy/notification-policy';
import * as repo from './notifications.repository';
import type {
  AdminNotificationListItem,
  AdminNotificationSummary,
  ListNotificationsFilters,
  ListNotificationsResult,
  NotificationChannel,
} from './notifications.types';

/**
 * Sanitizes notification failure reasons before they are returned to platform admins.
 * Masks email addresses and phone numbers (7+ digits) with generic tokens,
 * trims leading/trailing whitespace, and truncates the string to 200 characters.
 *
 * Exported pure function for testing.
 */
export function sanitizeFailureReason(reason: string | null): string | null {
  if (reason === null || reason === undefined) {
    return null;
  }

  // 1. Mask email addresses: foo@domain.com -> [email]
  let result = reason.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[email]',
  );

  // 2. Mask phone numbers: 7+ digits, optionally with +, -, spaces, dots, or parentheses
  result = result.replace(/(?:\+?\d[\d\s\-().]{5,}\d)/g, (match) => {
    const digitCount = match.replace(/\D/g, '').length;
    return digitCount >= 7 ? '[phone]' : match;
  });

  // Also catch standalone contiguous 7+ digits
  result = result.replace(/\b\d{7,}\b/g, '[phone]');

  // 3. Trim and truncate to 200 characters
  const trimmed = result.trim();
  if (trimmed.length > 200) {
    return trimmed.slice(0, 200);
  }

  return trimmed;
}

/**
 * Lists notifications across all clinics for platform administrative monitoring.
 * Permitted for both `super_admin` and `support` roles.
 */
export async function listNotifications(
  _ctx: PlatformContext,
  filters: ListNotificationsFilters,
): Promise<ListNotificationsResult> {
  const { rows, total } = await repo.listNotifications(filters);

  const overdueThresholdMs =
    Date.now() - OVERDUE_NOTIFICATION_HOURS * 60 * 60 * 1000;

  const notifications: AdminNotificationListItem[] = rows.map((row) => ({
    id: row.id,
    clinicId: row.clinicId,
    clinicName: row.clinicName,
    type: row.type,
    channel: row.channel,
    status: row.status,
    scheduledFor: row.scheduledFor,
    sentAt: row.sentAt,
    failureReason: sanitizeFailureReason(row.failureReason),
    isOverdue:
      row.status === 'scheduled' &&
      new Date(row.scheduledFor).getTime() < overdueThresholdMs,
  }));

  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;

  return {
    notifications,
    total,
    page,
    pageSize,
  };
}

/**
 * Aggregates notification delivery metrics across all clinics for platform monitoring.
 * Permitted for both `super_admin` and `support` roles.
 */
export async function getNotificationSummary(
  _ctx: PlatformContext,
): Promise<AdminNotificationSummary> {
  void _ctx;
  const raw = await repo.getNotificationSummaryData();

  // 1. Status breakdown for the last 7 days
  const last7Days: AdminNotificationSummary['last7Days'] = {
    scheduled: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
  };
  for (const s of raw.statusCountsLast7Days) {
    if (s.status in last7Days) {
      last7Days[s.status] = s.count;
    }
  }

  // 2. Channel breakdown for the last 7 days
  const countsByChannel: Record<NotificationChannel, number> = {
    whatsapp: 0,
    email: 0,
    sms: 0,
    push: 0,
  };
  for (const c of raw.countsByChannelLast7Days) {
    if (c.channel in countsByChannel) {
      countsByChannel[c.channel] = c.count;
    }
  }

  // 3. Top failure reasons (sanitized before grouping so identical sanitized strings merge)
  const reasonMap = new Map<string, number>();
  for (const item of raw.rawFailureReasonsLast7Days) {
    const sanitized = sanitizeFailureReason(item.reason);
    if (!sanitized) continue;
    const current = reasonMap.get(sanitized) ?? 0;
    reasonMap.set(sanitized, current + item.count);
  }

  const topFailureReasons = Array.from(reasonMap.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    last7Days,
    failedLast24h: raw.failedLast24h,
    overdueScheduledCount: raw.overdueScheduledCount,
    readOnlyClinicSkippedLast7Days: raw.readOnlyClinicSkippedLast7Days,
    topFailureReasons,
    countsByChannel,
  };
}
