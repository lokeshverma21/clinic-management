// lib/auth/clerk-webhook-verify.ts
import { Webhook } from 'svix';
import type { ClerkWebhookEvent } from './user-provisioning.types';

export class WebhookVerificationError extends Error {}

/**
 * Verifies a Clerk webhook's Svix signature and returns the typed payload.
 * Throws WebhookVerificationError on any failure. Callers must respond
 * with 400 and must NOT process the payload if this throws — Part 17:
 * "All webhook endpoints verify provider signatures... an unverified
 * webhook call is a spoofing risk."
 */
export function verifyClerkWebhook(params: {
  rawBody: string;
  svixId: string | null;
  svixTimestamp: string | null;
  svixSignature: string | null;
}): ClerkWebhookEvent {
  const { rawBody, svixId, svixTimestamp, svixSignature } = params;

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new WebhookVerificationError('Missing Svix headers');
  }

  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    throw new WebhookVerificationError('CLERK_WEBHOOK_SIGNING_SECRET is not configured');
  }

  const webhook = new Webhook(secret);

  try {
    return webhook.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    throw new WebhookVerificationError('Invalid Svix signature');
  }
}
