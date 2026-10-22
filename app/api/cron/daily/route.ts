import { NextResponse } from 'next/server';
import { isCronAuthorized } from '@/lib/api/cron-auth';
import {
  runSubscriptionEnforcement,
  type SubscriptionEnforcementResult,
} from '@/modules/admin/enforcement';
import { processDueNotifications } from '@/modules/notifications';

export interface DailyJobsResult {
  enforcement: SubscriptionEnforcementResult | null;
  notifications: { processed: number; failed: number } | null;
  errors: Record<string, string>;
}

/**
 * Executes the combined daily jobs in sequence:
 * 1. Subscription enforcement runs first so clinics suspended today are skipped by notifications.
 * 2. Notification processing runs second.
 *
 * Each job is isolated in its own try/catch block so one failure never blocks the other.
 */
export async function executeDailyJobs(
  enforce: () => Promise<SubscriptionEnforcementResult> = runSubscriptionEnforcement,
  processNotifications: () => Promise<{ processed: number; failed: number }> = processDueNotifications,
): Promise<DailyJobsResult> {
  const errors: Record<string, string> = {};
  let enforcement: SubscriptionEnforcementResult | null = null;
  let notifications: { processed: number; failed: number } | null = null;

  // 1. Run subscription enforcement FIRST
  try {
    enforcement = await enforce();
  } catch (error) {
    console.error('Daily cron: subscription enforcement failed', error);
    errors.enforcement = error instanceof Error ? error.message : 'Subscription enforcement failed';
  }

  // 2. Process due notifications
  try {
    notifications = await processNotifications();
  } catch (error) {
    console.error('Daily cron: notification processing failed', error);
    errors.notifications = error instanceof Error ? error.message : 'Notification processing failed';
  }

  return {
    enforcement,
    notifications,
    errors,
  };
}

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await executeDailyJobs();
  const hasErrors = Object.keys(result.errors).length > 0;
  const status = hasErrors ? 500 : 200;

  return NextResponse.json(result, { status });
}
