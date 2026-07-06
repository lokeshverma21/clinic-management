// src/modules/patients/index.ts
export * from './patients.types';
export { listPatients, getPatient, createPatient, updatePatient, archivePatient } from './patients.service';