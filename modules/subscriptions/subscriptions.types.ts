import type { NewSubscription, Subscription } from '@/db/schema';

export type { NewSubscription, Subscription };

export type CheckoutPlanKey = Extract<Subscription['plan'], 'starter' | 'professional'>;

export interface CheckoutSession {
  subscriptionId: string;
  subscriptionSessionId: string;
  sessionId: string;
}

export type SubscriptionPatch = Partial<
  Pick<
    NewSubscription,
    | 'plan' | 'staffSeatLimit' | 'billingCycle'
    | 'currentPeriodStart' | 'currentPeriodEnd'
    | 'status' | 'pausedAt' | 'cancelledAt'
  >
>;

export type BillingOverview = Pick<
  Subscription,
  'plan' | 'status' | 'staffSeatLimit' | 'currentPeriodEnd' | 'cancelledAt'
>;

export interface SyncResult {
  clinicId: string;
  cashfreeStatus: string;
  subscriptionStatus: Subscription['status'];
}

export interface StartSubscriptionInput {
  plan: CheckoutPlanKey;
}

export type WebhookOutcome = 'processed' | 'ignored' | 'duplicate' | 'invalid_signature' | 'malformed';

export interface SubscriptionPlanDetails {
  id: 'starter' | 'professional' | 'enterprise';
  name: string;
  amount: number | null;
  staffSeatLimit: number | null;
  selfServe: boolean;
  features: string[];
}

export interface SubscriptionHistoryItem {
  eventId: string;
  status: string;
  processedAt: string;
}

export interface SubscriptionDetailsPayload {
  subscription: Subscription | null;
  history: SubscriptionHistoryItem[];
  trialEndsAt: Date | null;
}

export type ManageAction = 'pause' | 'cancel' | 'resume' | 'uncancel';