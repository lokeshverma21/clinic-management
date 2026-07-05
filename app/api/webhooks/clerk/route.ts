// /app/api/webhooks/clerk/route.ts
import { NextResponse } from 'next/server';
import { verifyClerkWebhook, WebhookVerificationError } from '@/lib/auth/clerk-webhook-verify';
import { handleClerkWebhookEvent } from '@/lib/auth/user-provisioning.service';

// This route must be excluded from the auth/tenant-resolution middleware
// (Part 7: "Public routes... explicitly bypass steps 1–3, but the
// WhatsApp webhook uses its own separate verification" — the same applies
// here). Signature verification below is this route's own auth check.
export async function POST(request: Request) {
  const rawBody = await request.text();

  let event;
  try {
    event = verifyClerkWebhook({
      rawBody,
      svixId: request.headers.get('svix-id'),
      svixTimestamp: request.headers.get('svix-timestamp'),
      svixSignature: request.headers.get('svix-signature'),
    });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  try {
    const result = await handleClerkWebhookEvent(event);
    return NextResponse.json({ received: true, result });
  } catch (error) {
    console.error('Clerk webhook handler failed', { type: event.type, error });
    // 500 tells Clerk/Svix to retry — safe because handleUserCreated is
    // idempotent on duplicate delivery (Part 17).
    return NextResponse.json({ error: 'Internal error processing webhook' }, { status: 500 });
  }
}
