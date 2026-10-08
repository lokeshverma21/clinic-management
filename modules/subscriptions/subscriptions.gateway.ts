import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { GATEWAY_SUBSCRIPTION_ID_PATTERN } from './subscriptions.plans';

const envSchema = z.object({
  CASHFREE_ENV: z.enum(['sandbox', 'production']),
  CASHFREE_CLIENT_ID: z.string().min(1),
  CASHFREE_CLIENT_SECRET: z.string().min(1),
  CASHFREE_API_VERSION: z.string().min(1),
  APP_URL: z.string().url(),
});

let cachedEnv: z.infer<typeof envSchema> | null = null;
function env(): z.infer<typeof envSchema> {
  cachedEnv ??= envSchema.parse(process.env);
  return cachedEnv;
}

import { AppError } from '@/lib/errors/app-error';

export class CashfreeError extends AppError {
  constructor(public readonly status: number, message: string) {
    super('CASHFREE_ERROR', `Cashfree: ${message}`, status >= 400 && status < 500 ? status : 502);
    this.name = 'CashfreeError';
  }
}

const errorBodySchema = z.object({ message: z.string() });

async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  init: { method: 'GET' | 'POST'; body?: unknown } = { method: 'GET' },
): Promise<T> {
  const e = env();
  const base = e.CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

  const res = await fetch(`${base}${path}`, {
    method: init.method,
    headers: {
      'content-type': 'application/json',
      'x-api-version': e.CASHFREE_API_VERSION,
      'x-client-id': e.CASHFREE_CLIENT_ID,
      'x-client-secret': e.CASHFREE_CLIENT_SECRET,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: 'no-store',
  });

  const json: unknown = await res.json();
  if (!res.ok) {
    const parsed = errorBodySchema.safeParse(json);
    throw new CashfreeError(res.status, parsed.success ? parsed.data.message : 'Unexpected error response');
  }
  return schema.parse(json);
}

const createdSchema = z.object({
  cf_subscription_id: z.string(),
  subscription_session_id: z.string(),
  subscription_status: z.string(),
});

const fetchedSchema = z.object({
  subscription_id: z.string(),
  subscription_status: z.string(),
  next_schedule_date: z.string().nullable().optional(),
  subscription_tags: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type CashfreeCreated = z.infer<typeof createdSchema>;
export type CashfreeSubscription = z.infer<typeof fetchedSchema>;

export interface CreateCashfreeSubscriptionInput {
  subscriptionId: string;
  planName: string;
  amount: number;
  customer: { name: string; email: string; phone: string };
  returnUrl: string;
  tags: Record<string, string>;
}

function normalizeCashfreeCustomerName(raw: string): string {
  const normalized = raw
    .replace(/[^a-zA-Z0-9. ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized || 'Clinic Customer';
}

export function createCashfreeSubscription(p: CreateCashfreeSubscriptionInput): Promise<CashfreeCreated> {
  return request('/subscriptions', createdSchema, {
    method: 'POST',
    body: {
      subscription_id: p.subscriptionId,
      customer_details: {
        customer_name: normalizeCashfreeCustomerName(p.customer.name),
        customer_email: p.customer.email,
        customer_phone: p.customer.phone,
      },
      plan_details: {
        plan_name: p.planName,
        plan_type: 'PERIODIC',
        plan_currency: 'INR',
        plan_amount: p.amount,
        plan_max_amount: p.amount,
        plan_max_cycles: 100,
        plan_intervals: 1,
        plan_interval_type: 'MONTH',
      },
      authorization_details: {
        authorization_amount: 1,
        authorization_amount_refund: true,
        payment_methods: ['upi', 'card', 'enach'],
      },
      subscription_meta: { return_url: p.returnUrl, notification_channel: ['EMAIL'] },
      subscription_expiry_time: '2100-01-01T00:00:00+05:30',
      subscription_first_charge_time: new Date(Date.now() + 24 * 3600_000).toISOString(),
      subscription_tags: p.tags,
    },
  });
}

export function fetchCashfreeSubscription(subscriptionId: string): Promise<CashfreeSubscription> {
  return request(`/subscriptions/${encodeURIComponent(subscriptionId)}`, fetchedSchema);
}

// signature = base64(HMAC_SHA256(timestamp + rawBody, secretKey))
export function verifyWebhookSignature(rawBody: string, timestamp: string, signature: string): boolean {
  const expected = createHmac('sha256', env().CASHFREE_CLIENT_SECRET)
    .update(timestamp + rawBody)
    .digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Webhook payload shape isn't pinned down yet, so walk it for our own subscription ID.
// Tighten this once you've seen a real payload in the dashboard Logs.
export function extractSubscriptionId(value: unknown, depth = 0): string | null {
  if (depth > 5 || typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  const direct = record['subscription_id'];
  if (typeof direct === 'string' && GATEWAY_SUBSCRIPTION_ID_PATTERN.test(direct)) return direct;
  for (const child of Object.values(record)) {
    const found = extractSubscriptionId(child, depth + 1);
    if (found) return found;
  }
  return null;
}