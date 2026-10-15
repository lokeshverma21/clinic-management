import type { AppointmentWhatsAppContext } from '../../notification.types';
import { buildWhatsAppConfirmationMessage } from './templates/confirmation.template';
import { buildWhatsAppReminderMessage } from './templates/reminder.template';

/**
 * Normalises a raw phone string to an E.164-like digits-only form suitable
 * for the WhatsApp wa.me deep-link.
 *
 * Strips all non-digit characters.  Returns null when the result is empty or
 * clearly too short to be a real phone number (fewer than 7 digits).
 */
function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 7 ? digits : null;
}

/**
 * Builds a wa.me deep-link that opens WhatsApp with a pre-filled message.
 * Returns null when the phone number cannot be normalised.
 */
function buildWhatsAppUrl(phone: string, message: string): string | null {
  const normalised = normalisePhone(phone);
  if (!normalised) {
    return null;
  }
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalised}?text=${encoded}`;
}

export type WhatsAppMessageType = 'confirmation' | 'reminder';

/**
 * Returns the wa.me URL for the given message type, or null when the patient
 * phone number is missing or invalid.
 *
 * This is a pure client-side helper — it does NOT send any message; it opens
 * WhatsApp with a pre-filled message for the user to review and send manually.
 */
export function getWhatsAppUrl(
  type: WhatsAppMessageType,
  ctx: AppointmentWhatsAppContext,
): string | null {
  if (!ctx.patientPhone) {
    return null;
  }

  const message =
    type === 'confirmation'
      ? buildWhatsAppConfirmationMessage(ctx)
      : buildWhatsAppReminderMessage(ctx);

  return buildWhatsAppUrl(ctx.patientPhone, message);
}
