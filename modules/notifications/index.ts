export * from './notification.types';
export {
  getNotificationSettings,
  updateNotificationSettings,
  sendManualAppointmentConfirmationEmail,
  processDueNotifications,
} from './notification.service';
export {
  handleAppointmentCreated,
  handleAppointmentUpdated,
  handleAppointmentCanceled,
} from './notification.appointment-hooks';
