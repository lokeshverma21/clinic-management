import { randomUUID } from 'node:crypto';
import type { CheckoutPlanKey } from './subscriptions.types';

interface CheckoutPlan {
  name: string;
  amount: number;        // INR per month
  staffSeatLimit: number;
}

// PLACEHOLDER seat limits: set these to your real plan limits.
export const CHECKOUT_PLANS: Record<CheckoutPlanKey, CheckoutPlan> = {
  starter:      { name: 'Starter', amount: 999,  staffSeatLimit: 2 },
  professional: { name: 'Growth',  amount: 2499, staffSeatLimit: 10 },
};

export const GATEWAY_SUBSCRIPTION_ID_PATTERN = /^cos_[0-9a-f-]{36}$/;

export function newGatewaySubscriptionId(): string {
  return `cos_${randomUUID()}`;
}