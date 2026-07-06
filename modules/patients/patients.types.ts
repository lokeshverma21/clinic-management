// /modules/patients/patient.types.ts
import type { Patient } from '@/db/schema';

export type { Patient };

export interface CreatePatientInput {
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string; // ISO date string, e.g. '1990-05-12'
  gender?: 'male' | 'female' | 'other' | 'undisclosed';
  notes?: string;
}

export interface UpdatePatientInput {
  fullName?: string;
  phone?: string;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: 'male' | 'female' | 'other' | 'undisclosed' | null;
  notes?: string | null;
}

export interface ListPatientsFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ListPatientsResult {
  patients: Patient[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreatePatientResult {
  patient: Patient;
  // Part 9: "warn, don't block" — a shared household phone is legitimate,
  // so this is informational, never a reason the create call fails.
  duplicateWarning: boolean;
  possibleDuplicates: Patient[];
}