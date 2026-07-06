// modules/appointments/index.ts
export * from './appointment.types';
export {
  listAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  countUpcomingAppointmentsForMembership,
} from './appointment.service';