// /modules/patients/patient.service.ts
import { ForbiddenError, NotFoundError } from '@/lib/errors/app-error';
import type { RequestContext } from '@/lib/auth/request-context';
import * as patientRepository from './patients.repository';
import type {
  CreatePatientInput,
  UpdatePatientInput,
  ListPatientsFilters,
  ListPatientsResult,
  CreatePatientResult,
  Patient,
} from './patients.types';

export async function listPatients(
  ctx: RequestContext,
  filters: ListPatientsFilters,
): Promise<ListPatientsResult> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;

  const { rows, total } = await patientRepository.listPatients(ctx.clinicId, {
    search: filters.search,
    page,
    pageSize,
  });

  return { patients: rows, total, page, pageSize };
}

export async function getPatient(ctx: RequestContext, patientId: string): Promise<Patient> {
  const patient = await patientRepository.getPatientById(ctx.clinicId, patientId);
  if (!patient) throw new NotFoundError('PATIENT_NOT_FOUND', 'Patient not found');
  return patient;
}

/**
 * Duplicate phone numbers warn, they never block (Part 9: a clinic may
 * legitimately have two people sharing a household phone) — the caller
 * decides what to do with `possibleDuplicates`.
 */
export async function createPatient(
  ctx: RequestContext,
  input: CreatePatientInput,
): Promise<CreatePatientResult> {
  const possibleDuplicates = await patientRepository.findPatientsByPhone(ctx.clinicId, input.phone);

  const patient = await patientRepository.insertPatient(ctx.clinicId, {
    fullName: input.fullName,
    phone: input.phone,
    email: input.email ?? null,
    dateOfBirth: input.dateOfBirth ?? null,
    gender: input.gender ?? null,
    notes: input.notes ?? null,
  });

  return {
    patient,
    duplicateWarning: possibleDuplicates.length > 0,
    possibleDuplicates,
  };
}

export async function updatePatient(
  ctx: RequestContext,
  patientId: string,
  input: UpdatePatientInput,
): Promise<Patient> {
  const patient = await patientRepository.updatePatient(ctx.clinicId, patientId, input);
  if (!patient) throw new NotFoundError('PATIENT_NOT_FOUND', 'Patient not found');
  return patient;
}

/**
 * Permanent archive (soft-delete) — owner only (Part 9: "affects
 * historical reporting"). Enforced here, in the service layer, not just
 * hidden in the UI — Part 8 is explicit that a hidden button is a UX
 * nicety, not a security boundary.
 */
export async function archivePatient(ctx: RequestContext, patientId: string): Promise<Patient> {
  if (ctx.role !== 'owner') {
    throw new ForbiddenError('OWNER_ONLY', 'Only the clinic owner can archive a patient record');
  }

  const patient = await patientRepository.softDeletePatient(ctx.clinicId, patientId);
  if (!patient) throw new NotFoundError('PATIENT_NOT_FOUND', 'Patient not found');
  return patient;
}