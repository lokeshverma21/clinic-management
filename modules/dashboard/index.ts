// /modules/dashboard/index.ts

/**
 * Public surface of the dashboard module.
 *
 * Only the service function and the types needed by consumers are
 * exported. Repository functions are strictly internal — nothing outside
 * this module may call them directly. All writes still go through the
 * owning module (patients, appointments, etc.); the dashboard only reads.
 */
export { getDashboard } from './dashboard.service';

export type {
  DashboardResponse,
  DashboardStats,
  DashboardAppointment,
  DashboardPatient,
  DashboardDoctor,
  DashboardClinic,
  AppointmentStatus,
} from './dashboard.types';