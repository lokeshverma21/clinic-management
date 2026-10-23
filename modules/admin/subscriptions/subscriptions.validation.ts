// modules/admin/subscriptions/subscriptions.validation.ts
import { z } from 'zod';
import { subscriptionPlanEnum, subscriptionStatusEnum } from '@/db/schema/enums';

const emptyToUndefined = (val: unknown): unknown =>
  typeof val === 'string' && val.trim() === '' ? undefined : val;

export const subscriptionPlanSchema = z.enum(subscriptionPlanEnum.enumValues);
export const subscriptionStatusSchema = z.enum(subscriptionStatusEnum.enumValues);

export const listSubscriptionsQuerySchema = z.object({
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  pageSize: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(100).default(20)),
  search: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  status: z.preprocess(emptyToUndefined, subscriptionStatusSchema.optional()),
  plan: z.preprocess(emptyToUndefined, subscriptionPlanSchema.optional()),
});

export const listWebhookEventsQuerySchema = z.object({
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  pageSize: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(100).default(20)),
  status: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});

export const clinicIdParamSchema = z.object({
  clinicId: z.string().uuid('Invalid clinic ID format'),
});

export type ListSubscriptionsQueryInput = z.infer<typeof listSubscriptionsQuerySchema>;
export type ListWebhookEventsQueryInput = z.infer<typeof listWebhookEventsQuerySchema>;
export type ClinicIdParamInput = z.infer<typeof clinicIdParamSchema>;
