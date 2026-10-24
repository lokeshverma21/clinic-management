// modules/admin/dashboard/dashboard.service.ts
import 'server-only';
import type { PlatformContext } from '@/modules/admin/access';
import { listAuditLogs } from '@/modules/admin/audit-logs';
import { getSubscriptionPlans } from '@/modules/subscriptions';
import { PAST_DUE_GRACE_DAYS } from '@/lib/policy/subscription-policy';
import * as repo from './dashboard.repository';
import type {
  AdminDashboardData,
  AdminDashboardSignupMonth,
  AdminDashboardClinicStatusCount,
  AdminDashboardAtRiskClinic,
  ClinicStatus,
} from './dashboard.types';
import { getIstParts } from '@/lib/time';

/**
 * Generates an array of the last `count` months in IST (format 'YYYY-MM'),
 * zero-filled with any signup counts returned from the repository.
 */
function buildZeroFilledSignups(
  rawSignups: { month: string; count: number }[],
  monthCount: number = 6,
): AdminDashboardSignupMonth[] {
  const countsByMonth = new Map<string, number>();
  for (const s of rawSignups) {
    countsByMonth.set(s.month, s.count);
  }

  const result: AdminDashboardSignupMonth[] = [];
  const nowParts = getIstParts(Date.now());

  // Generate sequence from (monthCount - 1) months ago up to current month (IST)
  for (let i = monthCount - 1; i >= 0; i--) {
    let year = nowParts.year;
    let month = nowParts.month - i;
    while (month < 1) {
      month += 12;
      year -= 1;
    }
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, 1);
    const label = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(dateObj);

    result.push({
      month: monthKey,
      label,
      count: countsByMonth.get(monthKey) ?? 0,
    });
  }

  return result;
}

/**
 * Returns complete platform administration overview dashboard data.
 * Permitted for both `super_admin` and `support` platform roles.
 */
export async function getAdminDashboard(
  ctx: PlatformContext,
): Promise<AdminDashboardData> {
  // Execute independent database queries concurrently
  const [
    statusCounts,
    rawSignups,
    trialsEndingCount,
    trialsEndingList,
    atRiskList,
    activeSubsByPlan,
    auditLogsRes,
  ] = await Promise.all([
    repo.countClinicsByStatus(),
    repo.countSignupsByMonth(6),
    repo.countTrialsEndingSoon(7),
    repo.listTrialsEndingSoon(7, 5),
    repo.listAtRiskClinics(5),
    repo.getActiveSubscriptionsByPlan(),
    listAuditLogs(ctx, { page: 1, pageSize: 8 }),
  ]);

  // Compute MRR from active subscriptions and plan catalog
  const plans = getSubscriptionPlans();
  const planMap = new Map(plans.map((p) => [p.id, p]));

  let estimatedMrr = 0;
  let customPlanClinics = 0;

  for (const sub of activeSubsByPlan) {
    const planDef = planMap.get(sub.plan as 'starter' | 'professional' | 'enterprise');
    if (planDef) {
      if (planDef.amount !== null && planDef.amount > 0) {
        // Plan amounts in ClinicSeva are defined per month.
        // Even if an active subscription has a yearly billing cycle in metadata,
        // no separate discounted yearly rate exists in checkout plans, so we treat
        // plan amount as monthly for Estimated MRR calculation.
        estimatedMrr += planDef.amount * sub.count;
      } else {
        // Custom enterprise tier without fixed monthly amount
        customPlanClinics += sub.count;
      }
    } else {
      // Unrecognized plan tier
      customPlanClinics += sub.count;
    }
  }

  const totalClinics =
    statusCounts.trial +
    statusCounts.active +
    statusCounts.past_due +
    statusCounts.suspended +
    statusCounts.canceled;

  const activeClinics = statusCounts.active;
  const trialClinics = statusCounts.trial;
  const atRiskClinicsCount = statusCounts.past_due + statusCounts.suspended;

  // Zero-filled 6-month signups
  const signupsByMonth = buildZeroFilledSignups(rawSignups, 6);

  // Status breakdown array
  const orderedStatuses: ClinicStatus[] = [
    'trial',
    'active',
    'past_due',
    'suspended',
    'canceled',
  ];

  const clinicsByStatus: AdminDashboardClinicStatusCount[] = orderedStatuses.map((st) => ({
    status: st,
    count: statusCounts[st] ?? 0,
  }));

  // Enrich at-risk clinics with grace end timestamp
  const atRiskClinics: AdminDashboardAtRiskClinic[] = atRiskList.map((c) => {
    let graceEndsAt: Date | null = null;
    if (c.status === 'past_due' && c.pastDueSince) {
      graceEndsAt = new Date(
        new Date(c.pastDueSince).getTime() + PAST_DUE_GRACE_DAYS * 24 * 60 * 60 * 1000,
      );
    }
    return {
      clinicId: c.clinicId,
      clinicName: c.clinicName,
      status: c.status,
      suspensionSource: c.suspensionSource,
      pastDueSince: c.pastDueSince,
      graceEndsAt,
    };
  });

  return {
    kpis: {
      totalClinics,
      activeClinics,
      trialClinics,
      atRiskClinics: atRiskClinicsCount,
      estimatedMrr,
      customPlanClinics,
      trialsEndingSoonCount: trialsEndingCount,
    },
    signupsByMonth,
    clinicsByStatus,
    trialsEndingSoon: trialsEndingList,
    atRiskClinics,
    recentActivity: auditLogsRes.logs,
    generatedAt: new Date().toISOString(),
  };
}
