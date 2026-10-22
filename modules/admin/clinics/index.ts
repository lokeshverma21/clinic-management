// modules/admin/clinics/index.ts
export * from './clinics.types';
export {
  resolveReactivatedStatus,
  listClinics,
  getClinicDetail,
  suspendClinic,
  reactivateClinic,
  extendClinicTrial,
} from './clinics.service';
