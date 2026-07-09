// modules/clinic-profile/clinic-profile.validation.ts
import { z } from 'zod';

/**
 * Part 9: "Timezone must be a valid IANA timezone string — critical
 * correctness dependency for Appointments/Notifications." Intl throws a
 * RangeError for anything that isn't a real IANA identifier, which is a
 * more reliable check than a regex against a name pattern.
 */
function isValidIanaTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

const timezoneSchema = z
  .string()
  .trim()
  .min(1)
  .refine(isValidIanaTimezone, {
    message: 'Must be a valid IANA timezone identifier, e.g. "America/New_York"',
  });

const dayKeySchema = z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
const weeklyHoursSchema = z.object({
  mon: z.array(z.string()).optional(),
  tue: z.array(z.string()).optional(),
  wed: z.array(z.string()).optional(),
  thu: z.array(z.string()).optional(),
  fri: z.array(z.string()).optional(),
  sat: z.array(z.string()).optional(),
  sun: z.array(z.string()).optional(),
})
.partial()
.nullable()
.optional();

export const updateClinicProfileSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
  timezone: timezoneSchema.optional(),
  // Plain URL string for now — see clinic-profile.service.ts for why this
  // isn't a real upload yet.
  logoUrl: z.string().trim().url().nullable().optional(),
  operatingHours: weeklyHoursSchema,
});

export type UpdateClinicProfileSchema = z.infer<typeof updateClinicProfileSchema>;