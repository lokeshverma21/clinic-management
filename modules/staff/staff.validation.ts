// modules/staff/staff.validation.ts
import { z } from 'zod';

// Owner intentionally excluded from invites — see staff.types.ts.
const invitableRoleSchema = z.enum(['doctor', 'receptionist']);
const anyRoleSchema = z.enum(['owner', 'doctor', 'receptionist']);

const dayKeySchema = z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
const workingHoursSchema = z.record(dayKeySchema, z.array(z.string())).nullable().optional();

export const inviteStaffSchema = z.object({
  email: z.string().trim().email(),
  role: invitableRoleSchema,
});

export const updateStaffSchema = z.object({
  role: anyRoleSchema.optional(),
  specialization: z.string().trim().max(200).nullable().optional(),
  workingHours: workingHoursSchema,
  colorTag: z.string().trim().max(50).nullable().optional(),
});

export type InviteStaffSchema = z.infer<typeof inviteStaffSchema>;
export type UpdateStaffSchema = z.infer<typeof updateStaffSchema>;