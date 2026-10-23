// lib/policy/notification-policy.ts

/**
 * Vercel runs notifications once a day; lower this to about 1 on a server
 * that runs process-notifications every 15 minutes.  ON UBUNTU SERVER
 */
export const OVERDUE_NOTIFICATION_HOURS = 24;
