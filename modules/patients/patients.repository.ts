// /modules/patients/patient.repository.ts
import { and, eq, ilike, isNull, or, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { patients } from '@/db/schema';
import type { NewPatient, Patient } from '@/db/schema';

/**
 * Every function here requires `clinicId` as an explicit first parameter
 * by signature — Part 8's repository-layer enforcement of the Golden
 * Rule. There is no code path in this file that can query `patients`
 * without a clinic filter.
 */

export async function listPatients(
  clinicId: string,
  filters: { search?: string; page: number; pageSize: number },
): Promise<{ rows: Patient[]; total: number }> {
  const conditions = [eq(patients.clinicId, clinicId), isNull(patients.deletedAt)];

  if (filters.search) {
    const term = `%${filters.search}%`;
    const searchCondition = or(ilike(patients.fullName, term), ilike(patients.phone, term));
    if (searchCondition) conditions.push(searchCondition);
  }

  const where = and(...conditions);
  const offset = (filters.page - 1) * filters.pageSize;

  const [rows, countRows] = await Promise.all([
    db.select().from(patients).where(where).limit(filters.pageSize).offset(offset).orderBy(patients.fullName),
    db.select({ count: sql<number>`count(*)::int` }).from(patients).where(where),
  ]);

  return { rows, total: countRows[0]?.count ?? 0 };
}

export async function getPatientById(clinicId: string, patientId: string): Promise<Patient | null> {
  const [patient] = await db
    .select()
    .from(patients)
    .where(and(eq(patients.clinicId, clinicId), eq(patients.id, patientId), isNull(patients.deletedAt)))
    .limit(1);
  return patient ?? null;
}

export async function findPatientsByPhone(clinicId: string, phone: string): Promise<Patient[]> {
  return db
    .select()
    .from(patients)
    .where(and(eq(patients.clinicId, clinicId), eq(patients.phone, phone), isNull(patients.deletedAt)));
}

export async function insertPatient(
  clinicId: string,
  input: Omit<NewPatient, 'clinicId'>,
): Promise<Patient> {
  const [patient] = await db
    .insert(patients)
    .values({ ...input, clinicId })
    .returning();
  return patient;
}

export async function updatePatient(
  clinicId: string,
  patientId: string,
  patch: Partial<Omit<NewPatient, 'clinicId'>>,
): Promise<Patient | null> {
  const [patient] = await db
    .update(patients)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(patients.clinicId, clinicId), eq(patients.id, patientId), isNull(patients.deletedAt)))
    .returning();
  return patient ?? null;
}

/**
 * Soft delete only — Part 9: a patient record can never be hard-deleted
 * from the UI, to preserve appointment-history integrity.
 */
export async function softDeletePatient(clinicId: string, patientId: string): Promise<Patient | null> {
  const [patient] = await db
    .update(patients)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(patients.clinicId, clinicId), eq(patients.id, patientId), isNull(patients.deletedAt)))
    .returning();
  return patient ?? null;
}