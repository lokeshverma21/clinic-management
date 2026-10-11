import 'server-only';

import { BadRequestError } from '@/lib/errors/app-error';

import { buildConfirmationEmail } from './templates/confirmation.template';
import { buildReminderEmail } from './templates/reminder.template';
import { sendEmail } from './email.provider';
import type { AppointmentEmailContext, NotificationType } from '../../notification.types';

function buildEmailContent(type: NotificationType, ctx: AppointmentEmailContext) {
  if (type === 'confirmation') {
    return buildConfirmationEmail(ctx);
  }
  if (type === 'reminder_1h') {
    return buildReminderEmail(ctx);
  }
  throw new BadRequestError('UNSUPPORTED_EMAIL_TYPE', `Email is not supported for notification type "${type}"`);
}

export async function sendAppointmentEmail(
  type: NotificationType,
  ctx: AppointmentEmailContext,
): Promise<void> {
  const content = buildEmailContent(type, ctx);
  await sendEmail({
    to: ctx.patientEmail,
    subject: content.subject,
    html: content.html,
    text: content.text,
  });
}
