import 'server-only';

import { BadRequestError, ForbiddenError, NotFoundError } from '@/lib/errors/app-error';
import type { RequestContext } from '@/lib/auth/request-context';
import type { Appointment } from '@/db/schema';
import * as appointmentRepository from '@/modules/appointments/appointment.repository';
import * as notificationRepository from './notification.repository';
import { sendAppointmentEmail } from './channels/email/email.service';
import type { NotificationSettings, UpdateNotificationSettingsInput } from './notification.types';

const REMINDER_ELIGIBLE_STATUSES = new Set<Appointment['status']>(['booked', 'confirmed']);

function assertCanModifyAppointment(ctx: RequestContext, appointment: Appointment): void {
  if (ctx.role === 'doctor' && appointment.doctorMembershipId !== ctx.membershipId) {
    throw new ForbiddenError('FORBIDDEN', 'Doctors can only manage their own appointments');
  }
}

export async function getNotificationSettings(ctx: RequestContext): Promise<NotificationSettings> {
  const settings = await notificationRepository.getOrCreateNotificationSettings(ctx.clinicId);
  return { autoEmailRemindersEnabled: settings.autoEmailRemindersEnabled };
}

export async function updateNotificationSettings(
  ctx: RequestContext,
  input: UpdateNotificationSettingsInput,
): Promise<NotificationSettings> {
  if (ctx.role !== 'owner') {
    throw new ForbiddenError('OWNER_ONLY', 'Only the clinic owner can change notification settings');
  }

  const updated = await notificationRepository.updateNotificationSettings(
    ctx.clinicId,
    input.autoEmailRemindersEnabled,
  );
  if (!updated) {
    throw new NotFoundError('SETTINGS_NOT_FOUND', 'Notification settings could not be updated');
  }

  return { autoEmailRemindersEnabled: updated.autoEmailRemindersEnabled };
}

export async function sendManualAppointmentConfirmationEmail(
  ctx: RequestContext,
  appointmentId: string,
): Promise<void> {
  const appointment = await appointmentRepository.getAppointmentById(ctx.clinicId, appointmentId);
  if (!appointment) {
    throw new NotFoundError('APPOINTMENT_NOT_FOUND', 'Appointment not found');
  }

  assertCanModifyAppointment(ctx, appointment);

  const ctxEmail = await notificationRepository.getAppointmentEmailContext(ctx.clinicId, appointmentId);
  if (!ctxEmail) {
    throw new BadRequestError('PATIENT_EMAIL_MISSING', 'This patient does not have an email address on file');
  }

  const notification = await notificationRepository.insertScheduledNotification({
    clinicId: ctx.clinicId,
    appointmentId,
    patientId: appointment.patientId,
    type: 'confirmation',
    scheduledFor: new Date(),
  });

  try {
    await sendAppointmentEmail('confirmation', ctxEmail);
    await notificationRepository.finalizeNotificationSent(notification.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email send failed';
    await notificationRepository.markNotificationFailed(notification.id, message);
    throw new BadRequestError('EMAIL_SEND_FAILED', 'Could not send confirmation email. Please try again.');
  }
}

export async function processDueNotifications(batchSize = 50): Promise<{ processed: number; failed: number }> {
  const due = await notificationRepository.listDueScheduledNotifications(batchSize);
  let processed = 0;
  let failed = 0;

  for (const notification of due) {
    if (notification.channel !== 'email' || notification.type !== 'reminder_1h') {
      continue;
    }

    const autoEnabled = await notificationRepository.isAutoEmailRemindersEnabled(notification.clinicId);
    if (!autoEnabled) {
      await notificationRepository.markNotificationFailed(notification.id, 'AUTO_EMAIL_DISABLED');
      failed += 1;
      continue;
    }

    if (!notification.appointmentId) {
      await notificationRepository.markNotificationFailed(notification.id, 'MISSING_APPOINTMENT');
      failed += 1;
      continue;
    }

    const appointment = await notificationRepository.getAppointmentById(
      notification.clinicId,
      notification.appointmentId,
    );

    if (!appointment || !REMINDER_ELIGIBLE_STATUSES.has(appointment.status)) {
      await notificationRepository.markNotificationFailed(notification.id, 'APPOINTMENT_INELIGIBLE');
      failed += 1;
      continue;
    }

    const ctxEmail = await notificationRepository.getAppointmentEmailContext(
      notification.clinicId,
      notification.appointmentId,
    );

    if (!ctxEmail) {
      await notificationRepository.markNotificationFailed(notification.id, 'PATIENT_EMAIL_MISSING');
      failed += 1;
      continue;
    }

    try {
      await sendAppointmentEmail(notification.type, ctxEmail);
      const finalized = await notificationRepository.finalizeNotificationSent(notification.id);
      if (finalized) {
        processed += 1;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Email send failed';
      await notificationRepository.markNotificationFailed(notification.id, message);
      failed += 1;
    }
  }

  return { processed, failed };
}
