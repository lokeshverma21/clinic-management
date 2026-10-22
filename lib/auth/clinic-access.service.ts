// lib/auth/clinic-access.service.ts
import 'server-only';

import { ForbiddenError, NotFoundError } from '@/lib/errors/app-error';
import type { RequestContext } from '@/lib/auth/request-context';
import { READ_ONLY_CLINIC_STATUSES } from '@/lib/policy/subscription-policy';
import { getClinicStatusById } from './clinic-access.repository';

/**
 * Asserts that the caller's clinic is currently in an active, writable state.
 *
 * If the clinic is in a read-only lifecycle state (e.g. 'suspended' or 'canceled'),
 * mutations are blocked with CLINIC_READ_ONLY, prompting renewal or reactivation.
 */
export async function assertClinicWritable(ctx: RequestContext): Promise<void> {
  const status = await getClinicStatusById(ctx.clinicId);

  if (!status) {
    throw new NotFoundError('CLINIC_NOT_FOUND', 'Clinic not found');
  }

  if (READ_ONLY_CLINIC_STATUSES.includes(status)) {
    throw new ForbiddenError(
      'CLINIC_READ_ONLY',
      'This clinic account is read-only. Please renew the subscription to continue.',
    );
  }
}
