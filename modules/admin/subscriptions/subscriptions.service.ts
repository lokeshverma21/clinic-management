// modules/admin/subscriptions/subscriptions.service.ts
import 'server-only';

import type { PlatformContext } from '@/modules/admin/access';
import { NotFoundError } from '@/lib/errors/app-error';
import { getSubscriptionPlans } from '@/modules/subscriptions';
import * as repo from './subscriptions.repository';
import type {
  AdminPlanListItem,
  AdminSubscriptionDetail,
  AdminSubscriptionSummary,
  ListSubscriptionsFilters,
  ListSubscriptionsResult,
  ListWebhookEventsFilters,
  ListWebhookEventsResult,
} from './subscriptions.types';

/**
 * Lists subscriptions with pagination, status, plan, and clinic search filters.
 * Permitted for both `super_admin` and `support` platform roles.
 */
export async function listSubscriptions(
  _ctx: PlatformContext,
  filters: ListSubscriptionsFilters,
): Promise<ListSubscriptionsResult> {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;

  const { rows, total } = await repo.listSubscriptions({
    ...filters,
    page,
    pageSize,
  });

  return {
    subscriptions: rows,
    total,
    page,
    pageSize,
  };
}

/**
 * Returns aggregate subscription counts grouped by status and plan tier.
 * Permitted for both `super_admin` and `support` platform roles.
 */
export async function getSubscriptionSummary(
  _ctx: PlatformContext,
): Promise<AdminSubscriptionSummary> {
  void _ctx;
  return repo.getSubscriptionSummary();
}

/**
 * Retrieves comprehensive subscription detail for a clinic.
 * Throws NotFoundError when no subscription row exists.
 * Permitted for both `super_admin` and `support` platform roles.
 */
export async function getSubscriptionDetail(
  _ctx: PlatformContext,
  clinicId: string,
): Promise<AdminSubscriptionDetail> {
  const data = await repo.getSubscriptionByClinicId(clinicId);

  if (!data) {
    throw new NotFoundError(
      'SUBSCRIPTION_NOT_FOUND',
      'No subscription found for this clinic.',
    );
  }

  const allPlans = getSubscriptionPlans();
  const planDef = allPlans.find((p) => p.id === data.subscription.plan) ?? null;

  return {
    id: data.subscription.id,
    clinicId: data.subscription.clinicId,
    plan: data.subscription.plan,
    staffSeatLimit: data.subscription.staffSeatLimit,
    billingCycle: data.subscription.billingCycle,
    currentPeriodStart: data.subscription.currentPeriodStart,
    currentPeriodEnd: data.subscription.currentPeriodEnd,
    cashfreeSubscriptionId: data.subscription.cashfreeSubscriptionId,
    status: data.subscription.status,
    pausedAt: data.subscription.pausedAt,
    cancelledAt: data.subscription.cancelledAt,
    createdAt: data.subscription.createdAt,
    updatedAt: data.subscription.updatedAt,
    clinic: {
      id: data.clinic.id,
      name: data.clinic.name,
      slug: data.clinic.slug,
      status: data.clinic.status,
      phone: data.clinic.phone,
      address: data.clinic.address,
      timezone: data.clinic.timezone,
    },
    planDefinition: planDef,
  };
}

/**
 * Lists processed Cashfree webhook events with sanitized, PII-free metadata.
 * Permitted for both `super_admin` and `support` platform roles.
 */
export async function listWebhookEvents(
  _ctx: PlatformContext,
  filters: ListWebhookEventsFilters,
): Promise<ListWebhookEventsResult> {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;

  const { rows, total } = await repo.listWebhookEvents({
    ...filters,
    page,
    pageSize,
  });

  return {
    events: rows,
    total,
    page,
    pageSize,
  };
}

/**
 * Returns the SaaS plan catalog enriched with active clinic tenant adoption counts.
 * Permitted for both `super_admin` and `support` platform roles.
 */
export async function listPlans(
  _ctx: PlatformContext,
): Promise<AdminPlanListItem[]> {
  void _ctx;
  const plans = getSubscriptionPlans();
  const counts = await repo.countClinicsByPlan();

  return plans.map((plan) => ({
    ...plan,
    clinicCount: counts[plan.id] ?? 0,
  }));
}
