import 'server-only';

import type { Appointment } from '@/db/schema';
import * as notificationRepository from './notification.repository';
import { sendAppointmentEmail } from './channels/email/email.service';

const ONE_HOUR_MS = 60 * 60 * 1000;

const REMINDER_ELIGIBLE_STATUSES = new Set<Appointment['status']>(['booked', 'confirmed']);

function isEligibleForReminder(appointment: Appointment): boolean {
  return REMINDER_ELIGIBLE_STATUSES.has(appointment.status);
}

export async function handleAppointmentCreated(appointment: Appointment): Promise<void> {
  const autoEnabled = await notificationRepository.isAutoEmailRemindersEnabled(appointment.clinicId);
  if (!autoEnabled) {
    return;
  }

  await sendAutomaticConfirmationIfNeeded(appointment);
  await scheduleOneHourReminderIfNeeded(appointment);
}

export async function handleAppointmentUpdated(
  previous: Appointment,
  updated: Appointment,
): Promise<void> {
  const timeChanged =
    previous.startTime.getTime() !== updated.startTime.getTime() ||
    previous.endTime.getTime() !== updated.endTime.getTime();

  const statusBecameIneligible =
    isEligibleForReminder(previous) && !isEligibleForReminder(updated);

  if (statusBecameIneligible || updated.status === 'canceled') {
    await notificationRepository.cancelScheduledEmailNotificationsForAppointment(
      updated.clinicId,
      updated.id,
      'APPOINTMENT_INELIGIBLE',
    );
    return;
  }

  if (!timeChanged) {
    return;
  }

  await notificationRepository.cancelScheduledEmailNotificationsForAppointment(
    updated.clinicId,
    updated.id,
    'APPOINTMENT_RESCHEDULED',
  );

  const autoEnabled = await notificationRepository.isAutoEmailRemindersEnabled(updated.clinicId);
  if (!autoEnabled || !isEligibleForReminder(updated)) {
    return;
  }

  await scheduleOneHourReminderIfNeeded(updated);
}

export async function handleAppointmentCanceled(appointment: Appointment): Promise<void> {
  await notificationRepository.cancelScheduledEmailNotificationsForAppointment(
    appointment.clinicId,
    appointment.id,
    'APPOINTMENT_CANCELED',
  );
}

async function sendAutomaticConfirmationIfNeeded(appointment: Appointment): Promise<void> {
  const alreadySent = await notificationRepository.hasActiveEmailNotification(
    appointment.clinicId,
    appointment.id,
    'confirmation',
  );
  if (alreadySent) {
    return;
  }

  const ctx = await notificationRepository.getAppointmentEmailContext(
    appointment.clinicId,
    appointment.id,
  );
  if (!ctx) {
    return;
  }

  const scheduledFor = new Date();
  const notification = await notificationRepository.insertScheduledNotification({
    clinicId: appointment.clinicId,
    appointmentId: appointment.id,
    patientId: appointment.patientId,
    type: 'confirmation',
    scheduledFor,
  });

  try {
    await sendAppointmentEmail('confirmation', ctx);
    await notificationRepository.finalizeNotificationSent(notification.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email send failed';
    await notificationRepository.markNotificationFailed(notification.id, message);
  }
}

async function scheduleOneHourReminderIfNeeded(appointment: Appointment): Promise<void> {
  if (!isEligibleForReminder(appointment)) {
    return;
  }

  const reminderAt = new Date(appointment.startTime.getTime() - ONE_HOUR_MS);
  if (reminderAt.getTime() <= Date.now()) {
    return;
  }

  const alreadyScheduled = await notificationRepository.hasActiveEmailNotification(
    appointment.clinicId,
    appointment.id,
    'reminder_1h',
  );
  if (alreadyScheduled) {
    return;
  }

  await notificationRepository.insertScheduledNotification({
    clinicId: appointment.clinicId,
    appointmentId: appointment.id,
    patientId: appointment.patientId,
    type: 'reminder_1h',
    scheduledFor: reminderAt,
  });
}
