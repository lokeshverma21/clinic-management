import type { Subscription } from '@/db/schema';
export type { Subscription };
export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise';
export interface SubscriptionPlanDetails { id: SubscriptionPlan; name: string; amount: number | null; currency: 'INR'; billingCycle: 'monthly'; staffSeatLimit: number | null; selfServe: boolean; }
export interface StartSubscriptionInput { plan: 'starter' | 'professional'; returnUrl: string; }
export interface StartSubscriptionResult { subscription: Subscription; sessionId: string; }
export interface SubscriptionHistoryItem { eventId: string; status: string; processedAt: Date; }
