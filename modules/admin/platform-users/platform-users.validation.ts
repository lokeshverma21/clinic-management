// modules/admin/platform-users/platform-users.validation.ts
import { z } from 'zod';
import { platformRoleEnum } from '@/db/schema';

export const platformRoleSchema = z.enum(platformRoleEnum.enumValues);

export const addPlatformUserSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  role: platformRoleSchema.default('support'),
});

export const updatePlatformUserRoleSchema = z.object({
  role: platformRoleSchema,
});

export const platformUserIdParamSchema = z.object({
  platformUserId: z.string().uuid('Invalid platform user ID format'),
});
