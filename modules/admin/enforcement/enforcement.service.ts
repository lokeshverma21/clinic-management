// modules/admin/enforcement/enforcement.service.ts
import 'server-only';

import { subDays } from 'date-fns';
import { db } from '@/db/client';
import { recordSystemAction } from '@/modules/admin/audit-logs';
import {
  PAST_DUE_GRACE_DAYS,
  TRIAL_EXPIRY_GRACE_DAYS,
} from '@/lib/policy/subscription-policy';
import * as enforcementRepository from './enforcement.repository';
import type { SubscriptionEnforcementResult } from './enforcement.types';

/**
 * Runs the automated subscription and trial enforcement job.
 *
 * Steps performed:
 * 1. Backfills `pastDueSince = now` for any clinics currently in `past_due` status
 *    with a null `pastDueSince`. These are NOT suspended in this pass.
 * 2. Suspends clinics in `past_due` status whose `pastDueSince` is older than `PAST_DUE_GRACE_DAYS`.
 *    Sets `suspensionSource = 'billing'` and records a system audit log.
 * 3. Suspends clinics in `trial` status whose `trialEndsAt` is older than `TRIAL_EXPIRY_GRACE_DAYS`
 *    and have no subscription with status 'active'. Sets `suspensionSource = 'billing'` and
 *    records a system audit log.
 *
 * Concurrency & Idempotency:
 * - Each suspension is executed in its own transaction (UPDATE + audit log).
 * - The UPDATE's WHERE clause asserts the expected previous status so concurrent webhooks are never overwritten.
 * - Running the job multiple times consecutively is idempotent.
 */
export async function runSubscriptionEnforcement(): Promise<SubscriptionEnforcementResult> {
  const now = new Date();
  const pastDueCutoff = subDays(now, PAST_DUE_GRACE_DAYS);
  const trialCutoff = subDays(now, TRIAL_EXPIRY_GRACE_DAYS);

  // 1. Backfill past_due clinics
  const backfilledPastDue = await enforcementRepository.backfillPastDueClinics(now);

  // 2. Suspend past_due grace-expired clinics
  const pastDueCandidates = await enforcementRepository.findPastDueGraceExpiredClinics(pastDueCutoff);
  let suspendedPastDue = 0;

  for (const candidate of pastDueCandidates) {
    const success = await db.transaction(async (tx) => {
      const updated = await enforcementRepository.suspendClinicWithExpectedStatus(
        candidate.id,
        'past_due',
        'billing',
        now,
        tx,
      );

      if (updated) {
        await recordSystemAction(
          {
            action: 'clinic.auto_suspended',
            targetType: 'clinic',
            targetId: candidate.id,
            clinicId: candidate.id,
            metadata: {
              reason: 'past_due_grace_expired',
              previousStatus: candidate.status,
            },
          },
          tx,
        );
      }

      return updated;
    });

    if (success) {
      suspendedPastDue += 1;
    }
  }

  // 3. Suspend trial-expired clinics without an active subscription
  const trialCandidates = await enforcementRepository.findTrialExpiredClinics(trialCutoff);
  let suspendedTrialExpired = 0;

  for (const candidate of trialCandidates) {
    const success = await db.transaction(async (tx) => {
      const updated = await enforcementRepository.suspendClinicWithExpectedStatus(
        candidate.id,
        'trial',
        'billing',
        now,
        tx,
      );

      if (updated) {
        await recordSystemAction(
          {
            action: 'clinic.auto_suspended',
            targetType: 'clinic',
            targetId: candidate.id,
            clinicId: candidate.id,
            metadata: {
              reason: 'trial_expired',
              previousStatus: candidate.status,
            },
          },
          tx,
        );
      }

      return updated;
    });

    if (success) {
      suspendedTrialExpired += 1;
    }
  }

  return {
    backfilledPastDue,
    suspendedPastDue,
    suspendedTrialExpired,
  };
}
