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

    if (!clinicStatus) {
      return;
    }

    const [current] = await tx
      .select({
        status: clinics.status,
        suspensionSource: clinics.suspensionSource,
      })
      .from(clinics)
      .where(eq(clinics.id, clinicId))
      .limit(1);

    if (!current) {
      return;
    }

    const now = new Date();

    if (current.status === 'suspended') {
      const source = current.suspensionSource ?? 'admin';
      if (source === 'admin') {
        // do NOT change the clinic at all
        return;
      }

      if (source === 'billing') {
        if (clinicStatus === 'active') {
          await tx
            .update(clinics)
            .set({
              status: 'active',
              suspensionSource: null,
              pastDueSince: null,
              updatedAt: now,
            })
            .where(eq(clinics.id, clinicId));
        } else if (clinicStatus === 'past_due') {
          // stay 'suspended'
          return;
        } else if (clinicStatus === 'canceled') {
          await tx
            .update(clinics)
            .set({
              status: 'canceled',
              suspensionSource: null,
              pastDueSince: null,
              updatedAt: now,
            })
            .where(eq(clinics.id, clinicId));
        }
      }
      return;
    }

    // Any other current status (trial, active, past_due, canceled)
    const clinicUpdate: Partial<typeof clinics.$inferInsert> = {
      status: clinicStatus,
      updatedAt: now,
    };

    if (clinicStatus === 'past_due') {
      if (current.status !== 'past_due') {
        clinicUpdate.pastDueSince = now;
      }
    } else if (clinicStatus === 'active' || clinicStatus === 'canceled') {
      clinicUpdate.pastDueSince = null;
    }

    await tx
      .update(clinics)
      .set(clinicUpdate)
      .where(eq(clinics.id, clinicId));
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