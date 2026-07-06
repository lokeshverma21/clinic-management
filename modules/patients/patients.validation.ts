// /modules/patients/patient.validation.ts
import { z } from 'zod';

// International format required for WhatsApp Cloud API delivery (Part 10)
// — validated here so a bad number is caught at entry, not silently
// discovered when a reminder fails to send later (Part 9).
const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, 'Phone must be in international format, e.g. +14155552671');

const genderSchema = z.enum(['male', 'female', 'other', 'undisclosed']);

export const createPatientSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(200),
  phone: phoneSchema,
  email: z.string().trim().email().optional(),
  dateOfBirth: z.string().date().optional(),
  gender: genderSchema.optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const updatePatientSchema = z.object({
  fullName: z.string().trim().min(1).max(200).optional(),
  phone: phoneSchema.optional(),
  email: z.string().trim().email().nullable().optional(),
  dateOfBirth: z.string().date().nullable().optional(),
  gender: genderSchema.nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const listPatientsQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreatePatientSchema = z.infer<typeof createPatientSchema>;
export type UpdatePatientSchema = z.infer<typeof updatePatientSchema>;
export type ListPatientsQuery = z.infer<typeof listPatientsQuerySchema>;