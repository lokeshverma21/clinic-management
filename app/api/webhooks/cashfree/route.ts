import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyCashfreeWebhook } from '@/lib/cashfree/subscriptions';
import { isCashfreeWebhookPayload, processCashfreeWebhook } from '@/modules/subscriptions/subscriptions.service';
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!verifyCashfreeWebhook(rawBody, request.headers.get('x-webhook-signature'), request.headers.get('x-webhook-timestamp'))) return NextResponse.json({ success: false, error: { code: 'INVALID_WEBHOOK_SIGNATURE', message: 'Invalid webhook signature' } }, { status: 401 });
  let payload: unknown; try { payload = JSON.parse(rawBody); } catch { return NextResponse.json({ success: false, error: { code: 'INVALID_WEBHOOK_PAYLOAD', message: 'Invalid webhook payload' } }, { status: 400 }); }
  if (!isCashfreeWebhookPayload(payload)) return NextResponse.json({ success: false, error: { code: 'INVALID_WEBHOOK_PAYLOAD', message: 'Invalid webhook payload' } }, { status: 400 });
  const tags = (payload.data as { subscription_details: { subscription_id: string; subscription_status: string }; subscription_tags?: { clinic_id?: string } }).subscription_tags;
  const eventId = (payload.data as { event_id?: string }).event_id ?? `${payload.type}:${payload.data.subscription_details.subscription_id}:${payload.data.subscription_details.subscription_status}`;
  if (!tags?.clinic_id) return NextResponse.json({ success: false, error: { code: 'WEBHOOK_CLINIC_NOT_FOUND', message: 'Webhook clinic not found' } }, { status: 400 });
  await processCashfreeWebhook(tags.clinic_id, eventId, payload);
  return NextResponse.json({ success: true, data: { received: true } });
}
