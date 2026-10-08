import { createHash } from 'node:crypto';
import { z } from 'zod';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors/app-error';
import type { RequestContext } from '@/lib/auth/request-context';
import * as clinicProfileService from '@/modules/clinic-profile/clinic-profile.service';
import type { Clinic } from '@/db/schema';
import * as repo from './subscriptions.repository';
import {
  createCashfreeSubscription,
  extractSubscriptionId,
  fetchCashfreeSubscription,
  verifyWebhookSignature,
} from './subscriptions.gateway';
import { CHECKOUT_PLANS, newGatewaySubscriptionId } from './subscriptions.plans';
import type {
  BillingOverview, CheckoutPlanKey, CheckoutSession, Subscription,
  SubscriptionPatch, SyncResult, WebhookOutcome, StartSubscriptionInput,
  SubscriptionPlanDetails, SubscriptionDetailsPayload, SubscriptionHistoryItem, ManageAction
} from './subscriptions.types';

interface Transition {
  subscriptionStatus: Subscription['status'] | null; // null = leave the row alone
  clinicStatus: Clinic['status'] | null;
}

const NO_CHANGE: Transition = { subscriptionStatus: null, clinicStatus: null };

const CASHFREE_TRANSITIONS: Record<string, Transition> = {
  INITIALIZED: NO_CHANGE,
  BANK_APPROVAL_PENDING: NO_CHANGE,
  LINK_EXPIRED: NO_CHANGE,
  ACTIVE: { subscriptionStatus: 'active', clinicStatus: 'active' },
  ON_HOLD: { subscriptionStatus: 'past_due', clinicStatus: 'past_due' },
  CARD_EXPIRED: { subscriptionStatus: 'past_due', clinicStatus: 'past_due' },
  PAUSED: { subscriptionStatus: 'paused', clinicStatus: null },
  CUSTOMER_PAUSED: { subscriptionStatus: 'paused', clinicStatus: null },
  CANCELLED: { subscriptionStatus: 'canceled', clinicStatus: 'canceled' },
  CUSTOMER_CANCELLED: { subscriptionStatus: 'canceled', clinicStatus: 'canceled' },
  COMPLETED: { subscriptionStatus: 'canceled', clinicStatus: 'canceled' },
  EXPIRED: { subscriptionStatus: 'canceled', clinicStatus: 'canceled' },
};

const planTagSchema = z.object({ plan: z.enum(['starter', 'professional']) });
const BLOCKING_STATUSES: Subscription['status'][] = ['active', 'past_due', 'paused'];
const THIRTY_DAYS_MS = 30 * 24 * 3600_000;
const FOURTEEN_DAYS_MS = 14 * 24 * 3600_000;

function assertOwner(ctx: RequestContext): void {
  if (ctx.role !== 'owner') {
    throw new ForbiddenError('OWNER_ONLY', 'Only the clinic owner can manage billing');
  }
}

// Cashfree needs a 10-digit Indian mobile number.
function normalizeIndianPhone(raw: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(local) ? local : null;
}

export function getSubscriptionPlans(): SubscriptionPlanDetails[] {
  return [
    {
      id: 'starter',
      name: 'Starter',
      amount: 999,
      staffSeatLimit: 2,
      selfServe: true,
      features: [
        '1 doctor, 2 staff seats',
        'Appointments & patient records',
        'WhatsApp confirmations',
        'Daily schedule view',
      ],
    },
    {
      id: 'professional',
      name: 'Growth',
      amount: 2499,
      staffSeatLimit: 10,
      selfServe: true,
      features: [
        'Up to 5 doctors, 10 staff seats',
        'Automatic 24h + 1h WhatsApp reminders',
        'Invoices & basic billing',
        'Reports: revenue & no-shows',
        'Priority support',
      ],
    },
    {
      id: 'enterprise',
      name: 'Multi-Branch',
      amount: null,
      staffSeatLimit: null,
      selfServe: false,
      features: [
        'Unlimited branches & staff',
        'Centralized reporting across clinics',
        'Role hierarchies per branch',
        'Dedicated onboarding',
      ],
    },
  ];
}

export async function startCheckout(
  ctx: RequestContext,
  planKey: CheckoutPlanKey,
  billingEmail: string,
): Promise<CheckoutSession> {
  assertOwner(ctx);

  const existing = await repo.findByClinicId(ctx.clinicId);
  if (existing && BLOCKING_STATUSES.includes(existing.status)) {
    throw new ConflictError('SUBSCRIPTION_EXISTS', 'This clinic already has an active or pending subscription');
  }

  const clinic = await clinicProfileService.getClinicProfile(ctx);
  const phone = normalizeIndianPhone(clinic.phone);
  if (!phone) {
    throw new ValidationError('CLINIC_PHONE_REQUIRED', 'Add a valid 10-digit clinic phone number in clinic profile before subscribing');
  }

  const plan = CHECKOUT_PLANS[planKey];
  const subscriptionId = newGatewaySubscriptionId();

  const cf = await createCashfreeSubscription({
    subscriptionId,
    planName: plan.name,
    amount: plan.amount,
    customer: { name: clinic.name, email: billingEmail, phone },
    returnUrl: `${process.env.APP_URL ?? ''}/settings/subscription/return?sid=${subscriptionId}`,
    tags: { plan: planKey, clinic_id: ctx.clinicId },
  });

  const now = new Date();
  const periodEnd = clinic.trialEndsAt ?? new Date(now.getTime() + FOURTEEN_DAYS_MS);
  await repo.upsertCheckoutAttempt(ctx.clinicId, subscriptionId, {
    plan: planKey,
    staffSeatLimit: plan.staffSeatLimit,
    billingCycle: 'monthly',
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    status: 'trialing',
  });

  return {
    subscriptionId,
    subscriptionSessionId: cf.subscription_session_id,
    sessionId: cf.subscription_session_id,
  };
}

export async function startSubscription(
  clinicId: string,
  ctx: RequestContext,
  input: StartSubscriptionInput,
  billingEmail: string,
): Promise<CheckoutSession> {
  return startCheckout(ctx, input.plan, billingEmail);
}

export async function getBillingOverview(clinicId: string, ctx: RequestContext): Promise<BillingOverview | null> {
  assertOwner(ctx);
  const row = await repo.findByClinicId(clinicId);
  if (!row) return null;
  return {
    plan: row.plan,
    status: row.status,
    staffSeatLimit: row.staffSeatLimit,
    currentPeriodEnd: row.currentPeriodEnd,
    cancelledAt: row.cancelledAt,
  };
}

export async function getSubscriptionDetails(
  clinicId: string,
  ctx: RequestContext,
): Promise<SubscriptionDetailsPayload> {
  assertOwner(ctx);
  const subscription = await repo.findByClinicId(clinicId);
  const clinic = await clinicProfileService.getClinicProfile(ctx);
  const events = await repo.listWebhookEvents(10);
  const history: SubscriptionHistoryItem[] = events.map((e) => ({
    eventId: e.eventId,
    status: e.status,
    processedAt: e.processedAt.toISOString(),
  }));

  return {
    subscription,
    history,
    trialEndsAt: clinic.trialEndsAt,
  };
}

export async function manageSubscription(
  clinicId: string,
  ctx: RequestContext,
  action: ManageAction,
): Promise<Subscription> {
  assertOwner(ctx);
  const existing = await repo.findByClinicId(clinicId);
  if (!existing) {
    throw new NotFoundError('SUBSCRIPTION_NOT_FOUND', 'No subscription found for this clinic');
  }

  const now = new Date();
  if (action === 'pause') {
    await repo.applyGatewayState(clinicId, existing.id, { status: 'paused', pausedAt: now }, null);
  } else if (action === 'cancel') {
    await repo.applyGatewayState(clinicId, existing.id, { status: 'canceled', cancelledAt: now }, 'canceled');
  } else if (action === 'resume') {
    await repo.applyGatewayState(clinicId, existing.id, { status: 'active', pausedAt: null }, 'active');
  }

  const updated = await repo.findByClinicId(clinicId);
  if (!updated) {
    throw new Error('Failed to retrieve updated subscription');
  }
  return updated;
}

// Return-page entry point: syncs only if the subscription belongs to the caller's clinic.
export async function syncSubscriptionForClinic(
  clinicId: string,
  ctx: RequestContext,
  gatewaySubscriptionId: string,
): Promise<SyncResult | null> {
  assertOwner(ctx);
  const row = await repo.findByCashfreeSubscriptionId(gatewaySubscriptionId);
  if (!row || row.clinicId !== clinicId) return null;
  return syncRow(row);
}

// The single place subscription state changes. Always trusts Cashfree's fetched status, never the webhook body.
async function syncRow(row: Subscription): Promise<SyncResult | null> {
  if (!row.cashfreeSubscriptionId) return null;

  const cf = await fetchCashfreeSubscription(row.cashfreeSubscriptionId);
  const transition: Transition = CASHFREE_TRANSITIONS[cf.subscription_status] ?? NO_CHANGE;

  if (transition.subscriptionStatus === null) {
    return { clinicId: row.clinicId, cashfreeStatus: cf.subscription_status, subscriptionStatus: row.status };
  }

  const now = new Date();
  const patch: SubscriptionPatch = { status: transition.subscriptionStatus };

  if (transition.subscriptionStatus === 'active') {
    const next = cf.next_schedule_date ? new Date(cf.next_schedule_date) : null;
    patch.pausedAt = null;
    patch.currentPeriodEnd = next && !Number.isNaN(next.getTime()) ? next : new Date(now.getTime() + THIRTY_DAYS_MS);
    if (row.status !== 'active') patch.currentPeriodStart = now;

    const tag = planTagSchema.safeParse(cf.subscription_tags);
    if (tag.success) {
      patch.plan = tag.data.plan;
      patch.staffSeatLimit = CHECKOUT_PLANS[tag.data.plan].staffSeatLimit;
      patch.billingCycle = 'monthly';
    }
  } else if (transition.subscriptionStatus === 'paused') {
    patch.pausedAt = row.pausedAt ?? now;
  } else if (transition.subscriptionStatus === 'canceled') {
    patch.cancelledAt = row.cancelledAt ?? now;
  }

  await repo.applyGatewayState(row.clinicId, row.id, patch, transition.clinicStatus);
  return { clinicId: row.clinicId, cashfreeStatus: cf.subscription_status, subscriptionStatus: transition.subscriptionStatus };
}

// System entry point (no user): authenticated by signature instead of ctx.
export async function receiveWebhook(input: {
  rawBody: string;
  timestamp: string | null;
  signature: string | null;
}): Promise<WebhookOutcome> {
  if (!input.timestamp || !input.signature) return 'invalid_signature';
  if (!verifyWebhookSignature(input.rawBody, input.timestamp, input.signature)) return 'invalid_signature';

  let payload: unknown;
  try {
    payload = JSON.parse(input.rawBody);
  } catch {
    return 'malformed';
  }

  const eventId = createHash('sha256').update(input.rawBody).digest('hex');
  if (await repo.webhookEventExists(eventId)) return 'duplicate';

  const gatewayId = extractSubscriptionId(payload);
  const row = gatewayId ? await repo.findByCashfreeSubscriptionId(gatewayId) : null;
  if (row) await syncRow(row); // throws on Cashfree failure -> route returns 500 -> Cashfree retries

  await repo.recordWebhookEvent(eventId, payload, row ? 'processed' : 'ignored');
  return row ? 'processed' : 'ignored';
}