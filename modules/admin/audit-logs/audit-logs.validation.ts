// modules/admin/audit-logs/audit-logs.validation.ts
import { z } from 'zod';

const emptyToUndefined = (val: unknown): unknown =>
  typeof val === 'string' && val.trim() === '' ? undefined : val;

export const listAuditLogsQuerySchema = z.object({
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  pageSize: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(100).default(20)),
  clinicId: z.preprocess(emptyToUndefined, z.string().uuid('Invalid clinic ID format').optional()),
  action: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  actorPlatformUserId: z.preprocess(emptyToUndefined, z.string().uuid('Invalid actor ID format').optional()),
  from: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  to: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});

export type ListAuditLogsQueryInput = z.infer<typeof listAuditLogsQuerySchema>;
