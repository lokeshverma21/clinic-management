// modules/clinic-profile/clinic-profile.repository.ts
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { clinics } from '@/db/schema';
import type { Clinic, NewClinic } from '@/db/schema';

export async function getClinicById(clinicId: string): Promise<Clinic | null> {
  const [clinic] = await db.select().from(clinics).where(eq(clinics.id, clinicId)).limit(1);
  return clinic ?? null;
}

export async function updateClinic(
  clinicId: string,
  patch: Partial<Pick<NewClinic, 'name' | 'phone' | 'address' | 'timezone' | 'logoUrl' | 'operatingHours' | 'onboardingCompletedAt'>>,
): Promise<Clinic | null> {
  const [clinic] = await db
    .update(clinics)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(clinics.id, clinicId))
    .returning();
  return clinic ?? null;
}