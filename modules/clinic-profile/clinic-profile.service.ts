// modules/clinic-profile/clinic-profile.service.ts
import { ForbiddenError, NotFoundError } from '@/lib/errors/app-error';
import type { RequestContext } from '@/lib/auth/request-context';
import * as clinicProfileRepository from './clinic-profile.repository';
import type { ClinicProfile, UpdateClinicProfileInput } from './clinic-profile.types';
import type { Clinic } from '@/db/schema';

function toProfile(clinic: Clinic): ClinicProfile {
  return {
    id: clinic.id,
    name: clinic.name,
    slug: clinic.slug,
    phone: clinic.phone,
    address: clinic.address,
    timezone: clinic.timezone,
    logoUrl: clinic.logoUrl,
    operatingHours: clinic.operatingHours ?? null,
    status: clinic.status,
    trialEndsAt: clinic.trialEndsAt,
    onboardingCompletedAt: clinic.onboardingCompletedAt ?? null,
  };
}

export async function getClinicProfile(ctx: RequestContext): Promise<ClinicProfile> {
  const clinic = await clinicProfileRepository.getClinicById(ctx.clinicId);
  if (!clinic) throw new NotFoundError('CLINIC_NOT_FOUND', 'Clinic not found');
  return toProfile(clinic);
}

/**
 * Owner-only edit (Part 9); every role can still read via getClinicProfile.
 *
 * Changing `timezone` here does NOT retroactively shift any already-
 * scheduled appointment's stored time (Part 9's business rule) — that's
 * not something this function has to implement, it's a guarantee that
 * falls out of appointments being stored as timestamptz (UTC) and this
 * function never touching the appointments table at all.
 *
 * `logoUrl` currently accepts a plain URL string, not a file upload —
 * Part 9 specifies logo upload through Cloudinary via a `lib/storage/`
 * wrapper, which doesn't exist yet (Part 4 lists the folder, nothing's
 * built there). This lets the field exist and be settable today; wiring
 * up real file upload is a separate, external-service-integration task.
 */
export async function updateClinicProfile(
  ctx: RequestContext,
  input: UpdateClinicProfileInput,
): Promise<ClinicProfile> {
  if (ctx.role !== 'owner') {
    throw new ForbiddenError('OWNER_ONLY', 'Only the clinic owner can edit the clinic profile');
  }

  const existingClinic = await clinicProfileRepository.getClinicById(ctx.clinicId);

  if (!existingClinic) {
    throw new NotFoundError('CLINIC_NOT_FOUND', 'Clinic not found');
  }

  const clinic = await clinicProfileRepository.updateClinic(ctx.clinicId, {
    ...input,
    onboardingCompletedAt: existingClinic.onboardingCompletedAt ?? new Date(),
  });
  if (!clinic) throw new NotFoundError('CLINIC_NOT_FOUND', 'Clinic not found');
  return toProfile(clinic);
}