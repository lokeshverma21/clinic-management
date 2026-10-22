// modules/admin/clinics/clinics.service.ts
import 'server-only';

import { db } from '@/db/client';
import { assertCanWrite, type PlatformContext } from '@/modules/admin/access';
import { recordAdminAction } from '@/modules/admin/audit-logs';
import { ConflictError, NotFoundError } from '@/lib/errors/app-error';
import type { Clinic } from '@/db/schema';
import {
  listClinics as repoListClinics,
  getClinicDetail as repoGetClinicDetail,
  getClinicById,
  getClinicSubscription,
  updateClinicStatus,
  updateClinicTrialEndsAt,
} from './clinics.repository';
import type {
  AdminClinicDetail,
  ClinicStatus,
  ExtendClinicTrialInput,
  ListClinicsFilters,
  ListClinicsResult,
  ReactivateClinicInput,
  SuspendClinicInput,
} from './clinics.types';

/**
 * Pure function to resolve the target status when reactivating a suspended clinic.
 *
 * Rules:
 * - If subscription status is 'active' -> 'active'
 * - Else if trialEndsAt is in the future -> 'trial'
 * - Else -> 'past_due'
 */
export function resolveReactivatedStatus(
  subscriptionStatus: string | null | undefined,
  trialEndsAt: Date | null | undefined,
  now = new Date(),
): ClinicStatus {
  if (subscriptionStatus === 'active') {
    return 'active';
  }

  if (trialEndsAt && new Date(trialEndsAt).getTime() > now.getTime()) {
    return 'trial';
  }

  return 'past_due';
}

/**
 * Lists clinics with filters and pagination.
 * Permitted for both `super_admin` and `support` roles.
 */
export async function listClinics(
  ctx: PlatformContext,
  filters: ListClinicsFilters,
): Promise<ListClinicsResult> {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;

  const { rows, total } = await repoListClinics({
    ...filters,
    page,
    pageSize,
  });

  return {
    clinics: rows,
    total,
    page,
    pageSize,
  };
}

/**
 * Retrieves aggregate clinic details, owner info, and usage counts.
 * Permitted for both `super_admin` and `support` roles.
 *
 * NOTE: Patient, appointment, and invoice details are never returned—only counts.
 */
export async function getClinicDetail(
  ctx: PlatformContext,
  clinicId: string,
): Promise<AdminClinicDetail> {
  const detail = await repoGetClinicDetail(clinicId);

  if (!detail) {
    throw new NotFoundError('CLINIC_NOT_FOUND', 'Clinic not found');
  }

  return detail;
}

/**
 * Suspends an active, trialing, or past_due clinic.
 * Requires `super_admin` (write permission).
 *
 * Executes the clinic status update and audit log write inside a single transaction.
 */
export async function suspendClinic(
  ctx: PlatformContext,
  clinicId: string,
  input: SuspendClinicInput,
): Promise<Clinic> {
  assertCanWrite(ctx);

  return db.transaction(async (tx) => {
    const existing = await getClinicById(clinicId, tx);
    if (!existing) {
      throw new NotFoundError('CLINIC_NOT_FOUND', 'Clinic not found');
    }

    const allowedTransitions: ClinicStatus[] = ['trial', 'active', 'past_due'];
    if (!allowedTransitions.includes(existing.status)) {
      throw new ConflictError(
        'INVALID_STATUS_TRANSITION',
        `Cannot suspend clinic with status '${existing.status}'. Allowed starting statuses: ${allowedTransitions.join(', ')}`,
      );
    }

    const updated = await updateClinicStatus(clinicId, 'suspended', tx);

    await recordAdminAction(
      ctx,
      {
        action: 'clinic.suspended',
        targetType: 'clinic',
        targetId: clinicId,
        clinicId,
        metadata: {
          previousStatus: existing.status,
          newStatus: 'suspended',
          reason: input.reason,
        },
      },
      tx,
    );

    return updated;
  });
}

/**
 * Reactivates a suspended clinic.
 * Requires `super_admin` (write permission).
 *
 * Resolves the appropriate restored status (active, trial, or past_due) based on
 * current subscription status and remaining trial days.
 * Executes the status update and audit log write inside a single transaction.
 */
export async function reactivateClinic(
  ctx: PlatformContext,
  clinicId: string,
  input: ReactivateClinicInput,
): Promise<Clinic> {
  assertCanWrite(ctx);

  return db.transaction(async (tx) => {
    const existing = await getClinicById(clinicId, tx);
    if (!existing) {
      throw new NotFoundError('CLINIC_NOT_FOUND', 'Clinic not found');
    }

    if (existing.status !== 'suspended') {
      throw new ConflictError(
        'INVALID_STATUS_TRANSITION',
        `Cannot reactivate clinic with status '${existing.status}'. Clinic must currently be in 'suspended' status.`,
      );
    }

    const sub = await getClinicSubscription(clinicId, tx);
    const newStatus = resolveReactivatedStatus(sub?.status, existing.trialEndsAt);

    const updated = await updateClinicStatus(clinicId, newStatus, tx);

    await recordAdminAction(
      ctx,
      {
        action: 'clinic.reactivated',
        targetType: 'clinic',
        targetId: clinicId,
        clinicId,
        metadata: {
          previousStatus: 'suspended',
          newStatus,
          reason: input.reason ?? null,
        },
      },
      tx,
    );

    return updated;
  });
}

/**
 * Extends the trial duration for a clinic currently in trial.
 * Requires `super_admin` (write permission).
 *
 * Sets new trialEndsAt = max(now, current trialEndsAt) + days.
 * Executes the trial extension and audit log write inside a single transaction.
 */
export async function extendClinicTrial(
  ctx: PlatformContext,
  clinicId: string,
  input: ExtendClinicTrialInput,
): Promise<Clinic> {
  assertCanWrite(ctx);

  return db.transaction(async (tx) => {
    const existing = await getClinicById(clinicId, tx);
    if (!existing) {
      throw new NotFoundError('CLINIC_NOT_FOUND', 'Clinic not found');
    }

    if (existing.status !== 'trial') {
      throw new ConflictError(
        'INVALID_STATUS_TRANSITION',
        `Cannot extend trial for clinic with status '${existing.status}'. Clinic status must be 'trial'.`,
      );
    }

    const nowTime = Date.now();
    const currentTrialEndsTime = existing.trialEndsAt
      ? new Date(existing.trialEndsAt).getTime()
      : nowTime;
    const baseTime = Math.max(nowTime, currentTrialEndsTime);
    const additionalMs = input.days * 24 * 60 * 60 * 1000;
    const newTrialEndsAt = new Date(baseTime + additionalMs);

    const updated = await updateClinicTrialEndsAt(clinicId, newTrialEndsAt, tx);

    await recordAdminAction(
      ctx,
      {
        action: 'clinic.trial_extended',
        targetType: 'clinic',
        targetId: clinicId,
        clinicId,
        metadata: {
          previousTrialEndsAt: existing.trialEndsAt?.toISOString() ?? null,
          newTrialEndsAt: newTrialEndsAt.toISOString(),
          days: input.days,
          reason: input.reason ?? null,
        },
      },
      tx,
    );

    return updated;
  });
}
