// modules/admin/clinics/clinics.validation.ts
import { z } from 'zod';
import { clinicStatusEnum } from '@/db/schema/enums';

const emptyToUndefined = (val: unknown): unknown =>
  typeof val === 'string' && val.trim() === '' ? undefined : val;

export const clinicStatusSchema = z.enum(clinicStatusEnum.enumValues);

export const listClinicsQuerySchema = z.object({
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  pageSize: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(100).default(20)),
  search: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  status: z.preprocess(emptyToUndefined, clinicStatusSchema.optional()),
});

export const clinicIdParamSchema = z.object({
  clinicId: z.string().uuid('Invalid clinic ID format'),
});

export const suspendClinicSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason cannot exceed 500 characters'),
});

export const reactivateClinicSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(500, 'Reason cannot exceed 500 characters')
    .optional(),
});

export const extendClinicTrialSchema = z.object({
  days: z.coerce
    .number()
    .int('Days must be an integer')
    .min(1, 'Days must be at least 1')
    .max(90, 'Days cannot exceed 90'),
  reason: z
    .string()
    .trim()
    .max(500, 'Reason cannot exceed 500 characters')
    .optional(),
});

export type ListClinicsQueryInput = z.infer<typeof listClinicsQuerySchema>;
export type ClinicIdParamInput = z.infer<typeof clinicIdParamSchema>;
export type SuspendClinicSchemaInput = z.infer<typeof suspendClinicSchema>;
export type ReactivateClinicSchemaInput = z.infer<typeof reactivateClinicSchema>;
export type ExtendClinicTrialSchemaInput = z.infer<typeof extendClinicTrialSchema>;
