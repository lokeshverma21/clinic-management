import { z } from 'zod';
import { GATEWAY_SUBSCRIPTION_ID_PATTERN } from './subscriptions.plans';

export const startSubscriptionSchema = z.object({
  plan: z.enum(['starter', 'professional']),
});

export const returnQuerySchema = z.object({
  sid: z.string().regex(GATEWAY_SUBSCRIPTION_ID_PATTERN),
});

export const manageSubscriptionSchema = z.object({
  action: z.enum(['pause', 'cancel', 'resume', 'uncancel']),
});