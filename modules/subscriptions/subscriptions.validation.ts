import { z } from 'zod';
export const startSubscriptionSchema = z.object({ plan: z.enum(['starter', 'professional']), returnUrl: z.string().url().max(2048) });
export const manageSubscriptionSchema = z.object({ action: z.enum(['pause', 'cancel']) });
export type StartSubscriptionSchema = z.infer<typeof startSubscriptionSchema>;
