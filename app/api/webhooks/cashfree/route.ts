import { subscriptionsService } from '@/modules/subscriptions';

export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text(); // raw body: signature is computed over it
  const outcome = await subscriptionsService.receiveWebhook({
    rawBody,
    timestamp: req.headers.get('x-webhook-timestamp'),
    signature: req.headers.get('x-webhook-signature'),
  });
  if (outcome === 'invalid_signature' || outcome === 'malformed') {
    return new Response(outcome, { status: 400 });
  }
  return new Response('ok', { status: 200 });
}