// modules/admin/clinics/clinics.types.ts
import { clinicStatusEnum } from '@/db/schema/enums';

export type ClinicStatus = (typeof clinicStatusEnum.enumValues)[number];

export interface AdminClinicListItem {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  status: ClinicStatus;
  trialEndsAt: Date | null;
  onboardingCompletedAt: Date | null;
  createdAt: Date;
  ownerName: string | null;
  ownerEmail: string | null;
  plan: string | null;
  subscriptionStatus: string | null;
}

export interface AdminClinicOwner {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  joinedAt: Date | null;
}

export interface AdminClinicStaffCounts {
  total: number;
  doctor: number;
  receptionist: number;
  owner: number;
}

export interface AdminClinicAppointmentCounts {
  total: number;
  last30Days: number;
}

export interface AdminClinicSubscriptionSummary {
  plan: string | null;
  status: string | null;
  billingCycle: string | null;
  currentPeriodEnd: Date | null;
  cashfreeSubscriptionId: string | null;
}

export interface AdminClinicDetail {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  timezone: string;
  logoUrl: string | null;
  status: ClinicStatus;
  suspensionSource: import('@/db/schema').ClinicSuspensionSource | null;
  pastDueSince: Date | null;
  trialEndsAt: Date | null;
  onboardingCompletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  owners: AdminClinicOwner[];
  staffCounts: AdminClinicStaffCounts;
  patientCount: number;
  appointmentCount: AdminClinicAppointmentCounts;
  subscriptionSummary: AdminClinicSubscriptionSummary | null;
}

export interface ListClinicsFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ClinicStatus;
}

export interface ListClinicsResult {
  clinics: AdminClinicListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SuspendClinicInput {
  reason: string;
}

export interface ReactivateClinicInput {
  reason?: string;
}

export interface ExtendClinicTrialInput {
  days: number;
  reason?: string;
}
