import { formatAppointmentDateTime } from '../../../notification.format';
import type {
  AppointmentEmailContext,
  EmailTemplateContent,
} from '../../../notification.types';

export function buildConfirmationEmail(
  ctx: AppointmentEmailContext,
): EmailTemplateContent {
  const when = formatAppointmentDateTime(
    ctx.startTime,
    ctx.clinicTimezone,
  );

  const subject = `Appointment confirmed — ${ctx.clinicName}`;

  const text = [
    `Hi ${ctx.patientName},`,
    '',
    `Your appointment at ${ctx.clinicName} is confirmed.`,
    '',
    `When: ${when}`,
    `Doctor: ${ctx.doctorName}`,
    '',
    'If you need to reschedule, please contact the clinic.',
    '',
    '— ClinicSeva',
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <title>Appointment Confirmed</title>
  </head>
  <body style="margin:0; padding:0; background-color:#F3F6F4; font-family:Arial, Helvetica, sans-serif; color:#1A2E35; -webkit-text-size-adjust:100%;">

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; background-color:#F3F6F4;">
      <tr>
        <td align="center" style="padding:36px 16px;">

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:560px;">

            <!-- Brand header -->
            <tr>
              <td style="padding:0 0 22px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="middle" style="padding-right:10px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:36px; height:36px; background-color:#0D4F4F; border-radius:8px;">
                        <tr>
                          <td align="center" valign="middle" style="color:#FFFFFF; font-size:22px; font-weight:bold; line-height:36px;">
                            +
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td valign="middle">
                      <p style="margin:0; color:#0D4F4F; font-size:19px; font-weight:700; letter-spacing:-0.5px; line-height:24px;">
                        ClinicSeva
                      </p>
                      <p style="margin:2px 0 0; color:#647773; font-size:11px; letter-spacing:0.7px; line-height:16px;">
                        CARE, MADE SIMPLER
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Main email card -->
            <tr>
              <td style="background-color:#FFFFFF; border:1px solid #E1E9E4; border-radius:10px; overflow:hidden;">

                <!-- Confirmation banner -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:32px 30px 28px; background-color:#E8F0E9; border-bottom:1px solid #D9E6DC;">

                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td valign="middle" style="padding-right:10px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:30px; height:30px; background-color:#0D4F4F; border-radius:50%;">
                              <tr>
                                <td align="center" valign="middle" style="color:#FFFFFF; font-size:17px; font-weight:bold; line-height:30px;">
                                  &#10003;
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td valign="middle">
                            <p style="margin:0; color:#0D4F4F; font-size:11px; font-weight:700; letter-spacing:1.2px; line-height:16px; text-transform:uppercase;">
                              Confirmation
                            </p>
                          </td>
                        </tr>
                      </table>

                      <h1 style="margin:20px 0 10px; color:#0D4F4F; font-size:28px; font-weight:700; letter-spacing:-0.8px; line-height:1.25;">
                        Appointment confirmed
                      </h1>

                      <p style="margin:0; color:#385C55; font-size:14px; line-height:23px;">
                        Your appointment has been successfully scheduled. Here are your appointment details.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Email body -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:30px;">

                      <p style="margin:0 0 12px; color:#1A2E35; font-size:15px; line-height:24px;">
                        Hi ${escapeHtml(ctx.patientName)},
                      </p>

                      <p style="margin:0 0 26px; color:#52635F; font-size:14px; line-height:23px;">
                        Your appointment at
                        <strong style="color:#0D4F4F; font-weight:700;">${escapeHtml(ctx.clinicName)}</strong>
                        is confirmed. Please keep these details handy for your visit.
                      </p>

                      <!-- Appointment details -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border:1px solid #E1E9E4; border-radius:8px;">

                        <tr>
                          <td colspan="2" style="padding:15px 18px; background-color:#F6F8F6; border-bottom:1px solid #E1E9E4;">
                            <p style="margin:0; color:#0D4F4F; font-size:11px; font-weight:700; letter-spacing:0.9px; line-height:16px; text-transform:uppercase;">
                              Your appointment details
                            </p>
                          </td>
                        </tr>

                        <tr>
                          <td width="34%" valign="top" style="padding:18px 8px 16px 18px; border-bottom:1px solid #E9EEEA;">
                            <p style="margin:0; color:#72817C; font-size:12px; line-height:19px;">
                              Date &amp; time
                            </p>
                          </td>
                          <td width="66%" valign="top" style="padding:18px 18px 16px 8px; border-bottom:1px solid #E9EEEA;">
                            <p style="margin:0; color:#1A2E35; font-size:14px; font-weight:700; line-height:21px;">
                              ${escapeHtml(when)}
                            </p>
                          </td>
                        </tr>

                        <tr>
                          <td width="34%" valign="top" style="padding:16px 8px 18px 18px;">
                            <p style="margin:0; color:#72817C; font-size:12px; line-height:19px;">
                              Doctor
                            </p>
                          </td>
                          <td width="66%" valign="top" style="padding:16px 18px 18px 8px;">
                            <p style="margin:0; color:#1A2E35; font-size:14px; font-weight:600; line-height:21px;">
                              ${escapeHtml(ctx.doctorName)}
                            </p>
                          </td>
                        </tr>

                      </table>

                      <!-- Rescheduling note -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                        <tr>
                          <td valign="top" width="24" style="padding:1px 10px 0 0; color:#0D4F4F; font-size:16px; line-height:22px;">
                            &#9432;
                          </td>
                          <td valign="top">
                            <p style="margin:0; color:#52635F; font-size:13px; line-height:21px;">
                              <strong style="color:#1A2E35;">Need to reschedule?</strong>
                              If your plans change, please contact the clinic directly.
                            </p>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:26px 16px 0;">

                <p style="margin:0 0 7px; color:#0D4F4F; font-size:13px; font-weight:700; line-height:20px;">
                  ClinicSeva
                </p>

                <p style="margin:0 0 12px; color:#71807A; font-size:12px; line-height:19px;">
                  Making clinic visits simpler, one appointment at a time.
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:220px;">
                  <tr>
                    <td style="height:1px; background-color:#DCE5DE; font-size:1px; line-height:1px;">
                      &nbsp;
                    </td>
                  </tr>
                </table>

                <p style="margin:12px 0 0; color:#89958F; font-size:11px; line-height:18px;">
                  This email confirms your appointment with the clinic.
                </p>

              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
</html>`.trim();

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}