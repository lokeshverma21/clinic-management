// modules/admin/notifications/notifications.types.ts
import type {
  notificationTypeEnum,
  notificationChannelEnum,
  notificationStatusEnum,
} from '@/db/schema/enums';

export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
export type NotificationChannel = (typeof notificationChannelEnum.enumValues)[number];
export type NotificationStatus = (typeof notificationStatusEnum.enumValues)[number];

export interface AdminNotificationListItem {
  id: string;
  clinicId: string;
  clinicName: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  scheduledFor: Date;
  sentAt: Date | null;
  failureReason: string | null;
  isOverdue: boolean;
}

export interface AdminNotificationSummary {
  last7Days: {
    scheduled: number;
    sent: number;
    delivered: number;
    failed: number;
  };
  failedLast24h: number;
  overdueScheduledCount: number;
  readOnlyClinicSkippedLast7Days: number;
  topFailureReasons: Array<{
    reason: string;
    count: number;
  }>;
  countsByChannel: Record<NotificationChannel, number>;
}

export interface ListNotificationsFilters {
  page?: number;
  pageSize?: number;
  status?: NotificationStatus;
  channel?: NotificationChannel;
  type?: NotificationType;
  clinicId?: string;
  onlyOverdue?: boolean;
  from?: string;
  to?: string;
  includeSummary?: boolean;
}

export interface ListNotificationsResult {
  notifications: AdminNotificationListItem[];
  total: number;
  page: number;
  pageSize: number;
}
