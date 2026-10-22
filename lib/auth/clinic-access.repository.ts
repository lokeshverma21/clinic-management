// lib/auth/clinic-access.repository.ts
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { clinics } from '@/db/schema';
import type { ClinicStatus } from '@/lib/policy/subscription-policy';

export async function getClinicStatusById(clinicId: string): Promise<ClinicStatus | null> {
  const [row] = await db
    .select({ status: clinics.status })
    .from(clinics)
    .where(eq(clinics.id, clinicId))
    .limit(1);

  return row ? (row.status as ClinicStatus) : null;
}
