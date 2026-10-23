// modules/admin/notifications/index.ts
export {
  listNotifications,
  getNotificationSummary,
  sanitizeFailureReason,
} from './notifications.service';

export type {
  AdminNotificationListItem,
  AdminNotificationSummary,
  ListNotificationsFilters,
  ListNotificationsResult,
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from './notifications.types';
