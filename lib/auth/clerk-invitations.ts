// lib/auth/clerk-invitations.ts
import { clerkClient } from '@clerk/nextjs/server';

/**
 * The created membership's id is stashed in publicMetadata — this is the
 * exact mechanism the `user.created` webhook handler already checks for
 * (see user-provisioning.service.ts) to decide "invited staff joining"
 * vs. "brand-new clinic owner signup." This function is what actually
 * produces that metadata; without it, the webhook's membershipId branch
 * would never fire.
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const firstChar = local?.[0] ?? '*';
  return `${firstChar}***@${domain}`;
}

export interface ClerkErrorItem {
  code: string;
  message: string;
  longMessage?: string;
}

export interface ClerkErrorResponse {
  status: number;
  clerkTraceId?: string;
  errors: ClerkErrorItem[];
}

export function isClerkErrorResponse(error: unknown): error is ClerkErrorResponse {
  if (typeof error !== 'object' || error === null) return false;
  const record = error as Record<string, unknown>;
  return (
    typeof record.status === 'number' &&
    Array.isArray(record.errors) &&
    record.errors.every(
      (item: unknown) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>).code === 'string' &&
        typeof (item as Record<string, unknown>).message === 'string',
    )
  );
}

const DUPLICATE_CODES = new Set(['form_identifier_exists', 'duplicate_record']);
const CONFIG_CODES = new Set([
  'form_param_value_invalid',
  'form_param_format_invalid',
  'form_param_nil',
  'form_parameter_missing',
  'invalid_parameter',
]);

export function mapClerkErrorToUserMessage(error: unknown): {
  message: string;
  status: number | string;
  codes: string[];
  messages: string[];
} {
  if (isClerkErrorResponse(error)) {
    const status = error.status;
    const codes = error.errors.map((e) => e.code);
    const messages = error.errors.map((e) => e.message);

    if (codes.some((code) => DUPLICATE_CODES.has(code))) {
      return {
        message: 'This email address already has a Clerk account or a pending invitation.',
        status,
        codes,
        messages,
      };
    }

    if (status === 401 || status === 403) {
      return {
        message: 'Invitation could not be created because of a server configuration problem. Please contact support.',
        status,
        codes,
        messages,
      };
    }

    if (status === 429) {
      return {
        message: 'Too many invitations right now. Please try again in a minute.',
        status,
        codes,
        messages,
      };
    }

    if (
      status === 400 &&
      (codes.some((code) => CONFIG_CODES.has(code)) ||
        messages.some((m) => m.toLowerCase().includes('redirect')))
    ) {
      return {
        message: 'Invitation could not be created because of a server configuration problem. Please contact support.',
        status,
        codes,
        messages,
      };
    }

    return {
      message: "We couldn't send the invitation right now. Please try again.",
      status,
      codes,
      messages,
    };
  }

  if (error instanceof Error) {
    const isConfigError =
      error.message.includes('NEXT_PUBLIC_APP_URL') || error.message.includes('APP_URL');
    return {
      message: isConfigError
        ? 'Invitation could not be created because of a server configuration problem. Please contact support.'
        : "We couldn't send the invitation right now. Please try again.",
      status: 'none',
      codes: [isConfigError ? 'CONFIG_ERROR' : error.name || 'ERROR'],
      messages: [error.message],
    };
  }

  return {
    message: "We couldn't send the invitation right now. Please try again.",
    status: 'none',
    codes: ['UNKNOWN'],
    messages: [typeof error === 'string' ? error : 'unknown error'],
  };
}

function getAppBaseUrl(): string {
  const candidate =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  const isProduction = process.env.NODE_ENV === 'production';

  if (!candidate) {
    if (!isProduction) {
      return 'http://localhost:3000';
    }
    throw new Error('NEXT_PUBLIC_APP_URL is not configured in production environment');
  }

  let url = candidate.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  url = url.replace(/\/+$/, '');

  if (isProduction && (url.includes('localhost') || url.includes('127.0.0.1'))) {
    throw new Error('NEXT_PUBLIC_APP_URL cannot point to localhost in production environment');
  }

  return url;
}

export async function sendStaffInvitation(params: {
  emailAddress: string;
  membershipId: string;
}) {
  const client = await clerkClient();

  // TODO: point this at a dedicated "accept invite" route once the
  // frontend has one; the plain sign-up page works for now since Clerk's
  // invitation flow pre-fills the email either way.
  const baseUrl = getAppBaseUrl();
  const redirectUrl = `${baseUrl}/sign-up`;

  return client.invitations.createInvitation({
    emailAddress: params.emailAddress,
    redirectUrl,
    publicMetadata: { membershipId: params.membershipId },
  });
}
