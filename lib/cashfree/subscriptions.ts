import { createHmac, timingSafeEqual } from 'node:crypto';
import { BadRequestError } from '@/lib/errors/app-error';

const apiVersion = '2026-01-01';
const baseUrl = process.env.CASHFREE_ENVIRONMENT === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';

export interface CashfreeSubscriptionRequest {
  subscription_id: string;
  customer_details: { customer_name: string; customer_email: string; customer_phone: string };
  plan_details: { plan_name: string; plan_type: 'PERIODIC'; plan_amount: number; plan_max_amount: number; plan_max_cycles: number; plan_intervals: 1; plan_currency: 'INR'; plan_interval_type: 'MONTH'; plan_note: string };
  authorization_details: { authorization_amount: number; authorization_amount_refund: boolean; payment_methods: Array<'upi' | 'enach' | 'card'> };
  subscription_meta: { return_url: string; notification_channel: Array<'EMAIL' | 'SMS'> };
  subscription_expiry_time: string;
  subscription_first_charge_time: string;
  subscription_tags: { clinic_id: string };
}
export interface CashfreeSubscriptionResponse { cf_subscription_id: string; subscription_id: string; subscription_session_id: string; subscription_status: string; authorisation_details?: { payment_id?: string }; }

function credentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new BadRequestError('CASHFREE_NOT_CONFIGURED', 'Cashfree is not configured');
  return { clientId, clientSecret };
}

export async function createCashfreeSubscription(request: CashfreeSubscriptionRequest): Promise<CashfreeSubscriptionResponse> {
  const { clientId, clientSecret } = credentials();
  const response = await fetch(`${baseUrl}/subscriptions`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-version': apiVersion, 'x-client-id': clientId, 'x-client-secret': clientSecret }, body: JSON.stringify(request) });
  const body: unknown = await response.json();
  if (!response.ok || !isCashfreeSubscriptionResponse(body)) throw new BadRequestError('CASHFREE_SUBSCRIPTION_FAILED', 'Could not start the Cashfree subscription');
  return body;
}

export async function manageCashfreeSubscription(cashfreeSubscriptionId: string, action: 'PAUSE' | 'CANCEL'): Promise<void> {
  const { clientId, clientSecret } = credentials();
  const response = await fetch(`${baseUrl}/subscriptions/${encodeURIComponent(cashfreeSubscriptionId)}/manage`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-version': apiVersion, 'x-client-id': clientId, 'x-client-secret': clientSecret }, body: JSON.stringify({ subscription_status: action }) });
  if (!response.ok) throw new BadRequestError('CASHFREE_SUBSCRIPTION_UPDATE_FAILED', 'Could not update the Cashfree subscription');
}

export function verifyCashfreeWebhook(rawBody: string, signature: string | null, timestamp: string | null): boolean {
  const secret = process.env.CASHFREE_WEBHOOK_SECRET;
  if (!secret || !signature || !timestamp) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}${rawBody}`).digest('base64');
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
}

function isCashfreeSubscriptionResponse(value: unknown): value is CashfreeSubscriptionResponse {
  return typeof value === 'object' && value !== null && typeof (value as { cf_subscription_id?: unknown }).cf_subscription_id === 'string' && typeof (value as { subscription_id?: unknown }).subscription_id === 'string' && typeof (value as { subscription_session_id?: unknown }).subscription_session_id === 'string' && typeof (value as { subscription_status?: unknown }).subscription_status === 'string';
}
