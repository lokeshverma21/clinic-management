import type {
  Clinic,
  subscriptionPlanEnum,
  subscriptionStatusEnum,
  billingCycleEnum,
} from '@/db/schema';
import type { SubscriptionPlanDetails } from '@/modules/subscriptions';

export type SubscriptionPlan = (typeof subscriptionPlanEnum.enumValues)[number];
export type SubscriptionStatus = (typeof subscriptionStatusEnum.enumValues)[number];
export type BillingCycle = (typeof billingCycleEnum.enumValues)[number];

export interface AdminSubscriptionListItem {
  id: string;
  clinicId: string;
  clinicName: string;
  clinicStatus: Clinic['status'];
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodEnd: Date;
  createdAt: Date;
}

export interface AdminSubscriptionClinicSummary {
  id: string;
  name: string;
  slug: string;
  status: Clinic['status'];
  phone: string | null;
  address: string | null;
  timezone: string;
}

export interface AdminSubscriptionDetail {
  id: string;
  clinicId: string;
  plan: SubscriptionPlan;
  staffSeatLimit: number;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cashfreeSubscriptionId: string | null;
  status: SubscriptionStatus;
  pausedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  clinic: AdminSubscriptionClinicSummary;
  planDefinition: SubscriptionPlanDetails | null;
}

export interface AdminSubscriptionSummary {
  total: number;
  byStatus: Record<SubscriptionStatus, number>;
  byPlan: Record<SubscriptionPlan, number>;
}

export interface WebhookEventListItem {
  id: string;
  eventId: string;
  status: string;
  processedAt: Date;
  eventType: string;
  gatewaySubscriptionId: string | null;
  clinicId: string | null;
  clinicName: string | null;
}

export interface AdminPlanListItem extends SubscriptionPlanDetails {
  clinicCount: number;
}

export interface ListSubscriptionsFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: SubscriptionStatus;
  plan?: SubscriptionPlan;
}

export interface ListSubscriptionsResult {
  subscriptions: AdminSubscriptionListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListWebhookEventsFilters {
  page?: number;
  pageSize?: number;
  status?: string;
}

export interface ListWebhookEventsResult {
  events: WebhookEventListItem[];
  total: number;
  page: number;
  pageSize: number;
}
