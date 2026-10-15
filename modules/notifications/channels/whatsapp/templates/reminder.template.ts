import { formatAppointmentDateTime } from '../../../notification.format';
import type { AppointmentWhatsAppContext } from '../../../notification.types';

/**
 * Builds the plain-text WhatsApp reminder message for an upcoming appointment.
 * Keep concise — WhatsApp messages are read on mobile.
 *
 * clinicName and clinicTimezone are optional; the message degrades gracefully
 * when called from the client-side "open WhatsApp" flow.
 */
export function buildWhatsAppReminderMessage(
  ctx: AppointmentWhatsAppContext,
): string {
  const clinicLabel = ctx.clinicName ?? 'clinic';
  const when = ctx.clinicTimezone
    ? formatAppointmentDateTime(ctx.startTime, ctx.clinicTimezone)
    : ctx.startTime.toLocaleString();

  return [
    `Hi ${ctx.patientName}`,
    '',
    `This is a friendly reminder about your upcoming appointment at *${clinicLabel}*.`,
    '',
    `*When:* ${when}`,
    `*Doctor:* ${ctx.doctorName}`,
    '',
    'Please try to arrive a few minutes early.',
    'If you need to reschedule, contact the clinic as soon as possible.',
    '',
    'See you soon! — ClinicSeva',
  ].join('\n');
}
