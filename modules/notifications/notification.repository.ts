import { and, eq, inArray, isNull, lte } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  appointments,
  clinicNotificationSettings,
  clinics,
  memberships,
  notifications,
  patients,
  users,
} from '@/db/schema';
import type { Appointment, Notification } from '@/db/schema';
import type { AppointmentEmailContext, NotificationType } from './notification.types';

const EMAIL_CHANNEL = 'email' as const;
const ACTIVE_NOTIFICATION_STATUSES = ['scheduled', 'sent', 'delivered'] as const;

export async function getOrCreateNotificationSettings(clinicId: string) {
  const [existing] = await db
    .select()
    .from(clinicNotificationSettings)
    .where(eq(clinicNotificationSettings.clinicId, clinicId))
    .limit(1);

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(clinicNotificationSettings)
    .values({ clinicId, autoEmailRemindersEnabled: false })
    .onConflictDoNothing()
    .returning();

  if (created) {
    return created;
  }

  const [row] = await db
    .select()
    .from(clinicNotificationSettings)
    .where(eq(clinicNotificationSettings.clinicId, clinicId))
    .limit(1);

  if (!row) {
    throw new Error('Failed to initialize clinic notification settings');
  }

  return row;
}

export async function updateNotificationSettings(
  clinicId: string,
  autoEmailRemindersEnabled: boolean,
) {
  await getOrCreateNotificationSettings(clinicId);

  const [updated] = await db
    .update(clinicNotificationSettings)
    .set({ autoEmailRemindersEnabled, updatedAt: new Date() })
    .where(eq(clinicNotificationSettings.clinicId, clinicId))
    .returning();

  return updated ?? null;
}

export async function isAutoEmailRemindersEnabled(clinicId: string): Promise<boolean> {
  const settings = await getOrCreateNotificationSettings(clinicId);
  return settings.autoEmailRemindersEnabled;
}

export async function getAppointmentEmailContext(
  clinicId: string,
  appointmentId: string,
): Promise<AppointmentEmailContext | null> {
  const [row] = await db
    .select({
      appointment: appointments,
      patientName: patients.fullName,
      patientEmail: patients.email,
      doctorName: users.fullName,
      clinicName: clinics.name,
      clinicTimezone: clinics.timezone,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(memberships, eq(appointments.doctorMembershipId, memberships.id))
    .innerJoin(users, eq(memberships.userId, users.id))
    .innerJoin(clinics, eq(appointments.clinicId, clinics.id))
    .where(
      and(
        eq(appointments.clinicId, clinicId),
        eq(appointments.id, appointmentId),
        isNull(appointments.deletedAt),
      ),
    )
    .limit(1);

  if (!row || !row.patientEmail) {
    return null;
  }

  return {
    appointmentId: row.appointment.id,
    clinicId: row.appointment.clinicId,
    patientId: row.appointment.patientId,
    patientName: row.patientName,
    patientEmail: row.patientEmail,
    doctorName: row.doctorName,
    clinicName: row.clinicName,
    clinicTimezone: row.clinicTimezone,
    startTime: row.appointment.startTime,
    endTime: row.appointment.endTime,
    status: row.appointment.status,
  };
}

export async function hasActiveEmailNotification(
  clinicId: string,
  appointmentId: string,
  type: NotificationType,
): Promise<boolean> {
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.clinicId, clinicId),
        eq(notifications.appointmentId, appointmentId),
        eq(notifications.type, type),
        eq(notifications.channel, EMAIL_CHANNEL),
        inArray(notifications.status, [...ACTIVE_NOTIFICATION_STATUSES]),
      ),
    )
    .limit(1);

  return rows.length > 0;
}

export async function insertScheduledNotification(input: {
  clinicId: string;
  appointmentId: string;
  patientId: string;
  type: NotificationType;
  scheduledFor: Date;
}): Promise<Notification> {
  const [row] = await db
    .insert(notifications)
    .values({
      clinicId: input.clinicId,
      appointmentId: input.appointmentId,
      patientId: input.patientId,
      type: input.type,
      channel: EMAIL_CHANNEL,
      status: 'scheduled',
      scheduledFor: input.scheduledFor,
    })
    .returning();

  return row;
}

export async function finalizeNotificationSent(notificationId: string): Promise<boolean> {
  const rows = await db
    .update(notifications)
    .set({ status: 'sent', sentAt: new Date(), updatedAt: new Date(), failureReason: null })
    .where(and(eq(notifications.id, notificationId), eq(notifications.status, 'scheduled')))
    .returning({ id: notifications.id });
  return rows.length > 0;
}

export async function markNotificationFailed(notificationId: string, reason: string): Promise<void> {
  await db
    .update(notifications)
    .set({ status: 'failed', failureReason: reason, updatedAt: new Date() })
    .where(eq(notifications.id, notificationId));
}

export async function cancelScheduledEmailNotificationsForAppointment(
  clinicId: string,
  appointmentId: string,
  reason: string,
): Promise<void> {
  await db
    .update(notifications)
    .set({ status: 'failed', failureReason: reason, updatedAt: new Date() })
    .where(
      and(
        eq(notifications.clinicId, clinicId),
        eq(notifications.appointmentId, appointmentId),
        eq(notifications.channel, EMAIL_CHANNEL),
        eq(notifications.status, 'scheduled'),
      ),
    );
}

export async function listDueScheduledNotifications(limit: number): Promise<Notification[]> {
  const now = new Date();
  return db
    .select()
    .from(notifications)
    .where(and(eq(notifications.status, 'scheduled'), lte(notifications.scheduledFor, now)))
    .orderBy(notifications.scheduledFor)
    .limit(limit);
}

export async function getNotificationById(notificationId: string): Promise<Notification | null> {
  const [row] = await db
    .select()
    .from(notifications)
    .where(eq(notifications.id, notificationId))
    .limit(1);
  return row ?? null;
}

export async function getAppointmentById(clinicId: string, appointmentId: string): Promise<Appointment | null> {
  const [row] = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.clinicId, clinicId), eq(appointments.id, appointmentId)))
    .limit(1);
  return row ?? null;
}
