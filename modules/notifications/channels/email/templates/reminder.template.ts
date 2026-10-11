
import { formatAppointmentDateTime } from '../../../notification.format';
import type {
  AppointmentEmailContext,
  EmailTemplateContent,
} from '../../../notification.types';

export function buildReminderEmail(
  ctx: AppointmentEmailContext,
): EmailTemplateContent {
  const when = formatAppointmentDateTime(
    ctx.startTime,
    ctx.clinicTimezone,
  );

  const subject = `Reminder: appointment in 1 hour — ${ctx.clinicName}`;

  const text = [
    `Hi ${ctx.patientName},`,
    '',
    `This is a friendly reminder that your appointment at ${ctx.clinicName} is coming up in about one hour.`,
    '',
    `When: ${when}`,
    `Doctor: ${ctx.doctorName}`,
    '',
    'Please try to arrive a few minutes before your scheduled time.',
    'If you need to reschedule, please contact the clinic.',
    '',
    'See you soon.',
    '',
    '— ClinicSeva',
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Reminder</title>
</head>
<body style="margin:0; padding:0; background-color:#F3F6F4; font-family:Arial, Helvetica, sans-serif; color:#1A2E35; -webkit-font-smoothing:antialiased;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F3F6F4; padding:32px 12px;">
    <tr>
      <td align="center">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px; background-color:#FFFFFF; border:1px solid #E3EAE5; border-radius:8px; overflow:hidden;">

          <!-- Brand header -->
          <tr>
            <td style="background-color:#0D4F4F; padding:25px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" style="font-size:21px; line-height:28px; font-weight:700; letter-spacing:-0.5px; color:#FFFFFF;">
                    ClinicSeva
                  </td>
                  <td align="right" style="font-size:11px; line-height:18px; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:#D2E8DC;">
                    APPOINTMENT UPDATE
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:32px 30px 12px;">

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#E8F0E9; border:1px solid #D6E5D9; border-radius:4px; padding:8px 12px;">
                    <span style="font-size:12px; line-height:18px; font-weight:700; color:#0D4F4F; letter-spacing:0.3px;">
                      &#9200;&nbsp; YOUR APPOINTMENT IS IN 1 HOUR
                    </span>
                  </td>
                </tr>
              </table>

              <h1 style="margin:0 0 12px; font-size:27px; line-height:35px; letter-spacing:-0.7px; font-weight:700; color:#1A2E35;">
                A quick reminder, ${escapeHtml(ctx.patientName)}.
              </h1>

              <p style="margin:0 0 26px; font-size:15px; line-height:25px; color:#52666A;">
                Your appointment at <strong style="color:#1A2E35;">${escapeHtml(ctx.clinicName)}</strong> is coming up in about one hour. Here are your appointment details.
              </p>

              <!-- Appointment details card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #E0E8E2; border-radius:6px; overflow:hidden;">

                <tr>
                  <td colspan="2" style="padding:15px 18px; background-color:#F4F8F5; border-bottom:1px solid #E0E8E2;">
                    <p style="margin:0; font-size:11px; line-height:17px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#52736A;">
                      APPOINTMENT DETAILS
                    </p>
                  </td>
                </tr>

                <tr>
                  <td width="34%" style="padding:17px 12px 17px 18px; border-bottom:1px solid #EDF1EE; vertical-align:top;">
                    <span style="font-size:13px; line-height:20px; color:#71817D;">Date &amp; time</span>
                  </td>
                  <td style="padding:17px 18px 17px 8px; border-bottom:1px solid #EDF1EE; vertical-align:top;">
                    <strong style="font-size:14px; line-height:21px; font-weight:600; color:#1A2E35;">${escapeHtml(when)}</strong>
                  </td>
                </tr>

                <tr>
                  <td width="34%" style="padding:17px 12px 17px 18px; vertical-align:top;">
                    <span style="font-size:13px; line-height:20px; color:#71817D;">Doctor</span>
                  </td>
                  <td style="padding:17px 18px 17px 8px; vertical-align:top;">
                    <strong style="font-size:14px; line-height:21px; font-weight:600; color:#1A2E35;">${escapeHtml(ctx.doctorName)}</strong>
                  </td>
                </tr>

              </table>

              <!-- Helpful note -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:22px;">
                <tr>
                  <td width="4" style="background-color:#1A6B6B; border-radius:2px;"></td>
                  <td style="padding:12px 15px; background-color:#F6F8F6;">
                    <p style="margin:0; font-size:13px; line-height:21px; color:#52666A;">
                      <strong style="color:#1A2E35;">A small tip</strong><br>
                      Please try to arrive a few minutes before your scheduled time. If you need to reschedule, contact the clinic directly.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:26px 0 22px; font-size:15px; line-height:24px; color:#52666A;">
                We look forward to seeing you soon.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 30px 24px; background-color:#F7F9F7; border-top:1px solid #E7EDE8;">
              <p style="margin:0 0 7px; font-size:14px; line-height:20px; font-weight:700; color:#0D4F4F;">
                ClinicSeva
              </p>
              <p style="margin:0; font-size:12px; line-height:19px; color:#7B8A85;">
                Simple, thoughtful clinic management.
              </p>
              <p style="margin:12px 0 0; font-size:11px; line-height:17px; color:#9AA7A1;">
                This is an automated appointment reminder from ${escapeHtml(ctx.clinicName)}.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
