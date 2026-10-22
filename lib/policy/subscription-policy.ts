// lib/policy/subscription-policy.ts
import { clinicStatusEnum } from '@/db/schema/enums';

export type ClinicStatus = (typeof clinicStatusEnum.enumValues)[number];

export const PAST_DUE_GRACE_DAYS = 7;
export const TRIAL_EXPIRY_GRACE_DAYS = 3;

export const READ_ONLY_CLINIC_STATUSES: readonly ClinicStatus[] = ['suspended', 'canceled'] as const;
