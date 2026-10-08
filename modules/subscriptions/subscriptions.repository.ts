import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/db/client';
import { clinics, subscriptions, subscriptionWebhookEvents } from '@/db/schema';
import type { Clinic, NewSubscription, Subscription } from '@/db/schema';
import type { SubscriptionPatch } from './subscriptions.types';

export async function findByClinicId(clinicId: string): Promise<Subscription | null> {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.clinicId, clinicId), isNull(subscriptions.deletedAt)))
    .limit(1);
  return row ?? null;
}

// System lookup (webhook / return page): the only caller that doesn't know clinicId yet.
export async function findByCashfreeSubscriptionId(id: string): Promise<Subscription | null> {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.cashfreeSubscriptionId, id), isNull(subscriptions.deletedAt)))
    .limit(1);
  return row ?? null;
}

// One subscription per clinic: insert the seed row, or just point the existing row at the new attempt.
export async function upsertCheckoutAttempt(
  clinicId: string,
  cashfreeSubscriptionId: string,
  seed: Omit<NewSubscription, 'clinicId' | 'cashfreeSubscriptionId'>,
): Promise<Subscription> {
  const [row] = await db
    .insert(subscriptions)
    .values({ ...seed, clinicId, cashfreeSubscriptionId })
    .onConflictDoUpdate({
      target: subscriptions.clinicId,
      set: {
        plan: seed.plan,
        staffSeatLimit: seed.staffSeatLimit,
        billingCycle: seed.billingCycle,
        currentPeriodStart: seed.currentPeriodStart,
        currentPeriodEnd: seed.currentPeriodEnd,
        status: seed.status,
        cashfreeSubscriptionId,
        cancelledAt: null,
        pausedAt: null,
        updatedAt: new Date(),
      },
    })
    .returning();
  if (!row) throw new Error('Failed to upsert subscription');
  return row;
}

export async function applyGatewayState(
  clinicId: string,
  subscriptionId: string,
  patch: SubscriptionPatch,
  clinicStatus: Clinic['status'] | null,
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(subscriptions)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(subscriptions.clinicId, clinicId), eq(subscriptions.id, subscriptionId)));
    if (clinicStatus) {
      await tx
        .update(clinics)
        .set({ status: clinicStatus, updatedAt: new Date() })
        .where(eq(clinics.id, clinicId));
    }
  });
}

export async function webhookEventExists(eventId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: subscriptionWebhookEvents.id })
    .from(subscriptionWebhookEvents)
    .where(eq(subscriptionWebhookEvents.eventId, eventId))
    .limit(1);
  return row !== undefined;
}

export async function recordWebhookEvent(eventId: string, payload: unknown, status: string): Promise<void> {
  await db
    .insert(subscriptionWebhookEvents)
    .values({ eventId, payload, status })
    .onConflictDoNothing({ target: subscriptionWebhookEvents.eventId });
}

export async function listWebhookEvents(limit = 10): Promise<Array<{ id: string; eventId: string; status: string; processedAt: Date }>> {
  return db
    .select({
      id: subscriptionWebhookEvents.id,
      eventId: subscriptionWebhookEvents.eventId,
      status: subscriptionWebhookEvents.status,
      processedAt: subscriptionWebhookEvents.processedAt,
    })
    .from(subscriptionWebhookEvents)
    .limit(limit);
}