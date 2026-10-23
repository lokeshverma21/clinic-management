// modules/admin/notifications/notifications.validation.ts
import { z } from 'zod';
import {
  notificationStatusEnum,
  notificationChannelEnum,
  notificationTypeEnum,
} from '@/db/schema/enums';

const emptyToUndefined = (val: unknown): unknown =>
  typeof val === 'string' && val.trim() === '' ? undefined : val;

const booleanPreprocessor = (val: unknown): unknown => {
  if (typeof val === 'string') {
    const trimmed = val.trim().toLowerCase();
    if (trimmed === 'true' || trimmed === '1') return true;
    if (trimmed === 'false' || trimmed === '0') return false;
    if (trimmed === '') return undefined;
  }
  return val;
};

export const notificationStatusSchema = z.enum(notificationStatusEnum.enumValues);
export const notificationChannelSchema = z.enum(notificationChannelEnum.enumValues);
export const notificationTypeSchema = z.enum(notificationTypeEnum.enumValues);

export const listNotificationsQuerySchema = z.object({
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  pageSize: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(100).default(20)),
  status: z.preprocess(emptyToUndefined, notificationStatusSchema.optional()),
  channel: z.preprocess(emptyToUndefined, notificationChannelSchema.optional()),
  type: z.preprocess(emptyToUndefined, notificationTypeSchema.optional()),
  clinicId: z.preprocess(emptyToUndefined, z.string().uuid('Invalid clinic ID format').optional()),
  onlyOverdue: z.preprocess(booleanPreprocessor, z.boolean().optional()),
  from: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  to: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  includeSummary: z.preprocess(booleanPreprocessor, z.boolean().optional()),
});

export type ListNotificationsQueryInput = z.infer<typeof listNotificationsQuerySchema>;
