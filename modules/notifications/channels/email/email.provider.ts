import "server-only";

import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getMailConfig() {
  const token = process.env.MAILTRAP_API_TOKEN;
  const fromEmail = process.env.MAILTRAP_FROM_EMAIL;
  const fromName = process.env.MAILTRAP_FROM_NAME;

  if (!token) {
    throw new Error("MAILTRAP_API_TOKEN is not configured");
  }
  if (!fromEmail || !fromName) {
    throw new Error("Mailtrap sender configuration is missing");
  }

  return { token, fromEmail, fromName };
}

function getTransporter(): ReturnType<typeof nodemailer.createTransport> {
  if (!transporter) {
    const { token } = getMailConfig();
    transporter = nodemailer.createTransport(MailtrapTransport({ token }));
  }
  return transporter;
}

export async function sendEmail(input: SendEmailInput) {
  const { fromEmail, fromName } = getMailConfig();
  return getTransporter().sendMail({
    from: {
      address: fromEmail,
      name: fromName,
    },
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}
