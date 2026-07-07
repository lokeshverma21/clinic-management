// modules/clinic-profile/clinic-profile.types.ts
import type { Clinic, WeeklyHours } from '@/db/schema';

export type { Clinic, WeeklyHours };

export interface ClinicProfile {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  timezone: string;
  logoUrl: string | null;
  operatingHours: WeeklyHours | null;
  status: Clinic['status'];
  trialEndsAt: Date | null;
}

/**
 * Deliberately excludes `slug` and `status` — slug is a stable identifier
 * once set, and status is driven by the Billing module's subscription
 * lifecycle (Part 9), not something an owner can flip directly through
 * this endpoint.
 */
export interface UpdateClinicProfileInput {
  name?: string;
  phone?: string | null;
  address?: string | null;
  timezone?: string;
  logoUrl?: string | null;
  operatingHours?: WeeklyHours | null;
}