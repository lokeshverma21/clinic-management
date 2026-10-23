// modules/admin/dashboard/dashboard.types.ts
import type { Clinic, clinicStatusEnum } from '@/db/schema';
import type { AdminAuditLogWithActor } from '@/modules/admin/audit-logs';

export type ClinicStatus = (typeof clinicStatusEnum.enumValues)[number];
export type ClinicSuspensionSource = NonNullable<Clinic['suspensionSource']>;

export interface AdminDashboardKpis {
  totalClinics: number;
  activeClinics: number;
  trialClinics: number;
  atRiskClinics: number;
  estimatedMrr: number;
  customPlanClinics: number;
  trialsEndingSoonCount: number;
}

export interface AdminDashboardSignupMonth {
  month: string; // YYYY-MM
  label: string; // e.g. "Oct 2026"
  count: number;
}

export interface AdminDashboardClinicStatusCount {
  status: ClinicStatus;
  count: number;
}

export interface AdminDashboardTrialEndingSoon {
  clinicId: string;
  clinicName: string;
  trialEndsAt: Date;
}

export interface AdminDashboardAtRiskClinic {
  clinicId: string;
  clinicName: string;
  status: ClinicStatus;
  suspensionSource: ClinicSuspensionSource | null;
  pastDueSince: Date | null;
  graceEndsAt: Date | null;
}

export interface AdminDashboardData {
  kpis: AdminDashboardKpis;
  signupsByMonth: AdminDashboardSignupMonth[];
  clinicsByStatus: AdminDashboardClinicStatusCount[];
  trialsEndingSoon: AdminDashboardTrialEndingSoon[];
  atRiskClinics: AdminDashboardAtRiskClinic[];
  recentActivity: AdminAuditLogWithActor[];
  generatedAt: string;
}
