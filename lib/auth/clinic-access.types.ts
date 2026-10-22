// lib/auth/clinic-access.types.ts
import type { ClinicStatus } from '@/lib/policy/subscription-policy';

export type { ClinicStatus };

export interface ClinicAccessState {
  id: string;
  status: ClinicStatus;
}
