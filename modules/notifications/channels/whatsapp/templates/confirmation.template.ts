import { formatAppointmentDateTime } from '../../../notification.format';
import type { AppointmentWhatsAppContext } from '../../../notification.types';

/**
 * Builds the plain-text WhatsApp confirmation message for an appointment.
 * Keep concise — WhatsApp messages are read on mobile.
 *
 * clinicName and clinicTimezone are optional; the message degrades gracefully
 * when called from the client-side "open WhatsApp" flow (where those values
 * are not yet available). Server-side automated sends will always supply them.
 */
export function buildWhatsAppConfirmationMessage(
  ctx: AppointmentWhatsAppContext,
): string {
  const clinicLabel = ctx.clinicName ?? 'clinic';
  const when = formatAppointmentDateTime(ctx.startTime);

  return [
    `Hi ${ctx.patientName}`,
    '',
    `Your appointment at *${clinicLabel}* is confirmed.`,
    '',
    `*When:* ${when}`,
    `*Doctor:* ${ctx.doctorName}`,
    '',
    'If you need to reschedule, please contact the clinic.',
    '',
    '— ClinicSeva',
  ].join('\n');
}
