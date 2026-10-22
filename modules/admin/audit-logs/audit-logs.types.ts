// modules/admin/audit-logs/audit-logs.types.ts
import type { PlatformAuditLog } from '@/db/schema';

export const ADMIN_AUDIT_ACTIONS = [
  'clinic.suspended',
  'clinic.reactivated',
  'clinic.trial_extended',
  'subscription.trial_extended',
  'platform_user.added',
  'platform_user.role_changed',
  'platform_user.removed',
] as const;

export type AdminAuditAction = (typeof ADMIN_AUDIT_ACTIONS)[number];

export type AdminAuditLog = PlatformAuditLog;

export interface AdminAuditLogActor {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface AdminAuditLogClinic {
  id: string;
  name: string;
}

export interface AdminAuditLogWithActor extends AdminAuditLog {
  actor?: AdminAuditLogActor | null;
  clinic?: AdminAuditLogClinic | null;
}

export interface RecordAdminActionInput {
  action: AdminAuditAction;
  targetType: string;
  targetId?: string | null;
  clinicId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ListAuditLogsFilters {
  page?: number;
  pageSize?: number;
  clinicId?: string;
  action?: string;
  actorPlatformUserId?: string;
  from?: string;
  to?: string;
}

export interface ListAuditLogsResult {
  logs: AdminAuditLogWithActor[];
  total: number;
  page: number;
  pageSize: number;
}
