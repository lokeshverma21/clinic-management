import type { Notification } from '@/db/schema';

export type { Notification };
export type NotificationType = Notification['type'];

export interface NotificationSettings {
  autoEmailRemindersEnabled: boolean;
}

export interface UpdateNotificationSettingsInput {
  autoEmailRemindersEnabled: boolean;
}

export interface AppointmentEmailContext {
  appointmentId: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  clinicName: string;
  clinicTimezone: string;
  startTime: Date;
  endTime: Date;
  status: string;
}

export interface AppointmentWhatsAppContext {
  appointmentId: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  /** Optional for client-side opens; resolved server-side for automated sends. */
  clinicName?: string;
  /** Optional for client-side opens; resolved server-side for automated sends. */
  clinicTimezone?: string;
  startTime: Date;
  endTime: Date;
  status: string;
}

export interface EmailTemplateContent {
  subject: string;
  html: string;
  text: string;
}
