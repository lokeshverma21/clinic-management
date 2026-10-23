// modules/admin/subscriptions/subscriptions.repository.ts
import { and, desc, eq, ilike, inArray, isNull, sql, type SQL } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  clinics,
  subscriptions,
  subscriptionWebhookEvents,
  type Subscription,
  type Clinic,
} from '@/db/schema';
import type {
  AdminSubscriptionListItem,
  AdminSubscriptionSummary,
  ListSubscriptionsFilters,
  ListWebhookEventsFilters,
  SubscriptionPlan,
  SubscriptionStatus,
  WebhookEventListItem,
} from './subscriptions.types';

/**
 * Platform Subscriptions Repository (READ-ONLY)
 *
 * NOTE: Functions in this repository are intentionally NOT scoped with `clinicId`
 * as the first parameter. Unlike tenant-level repositories where multi-tenancy
 * requires strict clinic partitioning, platform subscriptions operations are platform-wide
 * administrative queries.
 *
 * READ-ONLY GUARANTEE:
 * This repository contains ZERO write, update, or delete operations. It strictly queries
 * `subscriptions`, `clinics`, and `subscription_webhook_events` for administrative observability.
 * Gateway secrets and raw webhook payloads containing customer PII are NEVER returned.
 */

export async function listSubscriptions(
  filters: ListSubscriptionsFilters,
): Promise<{ rows: AdminSubscriptionListItem[]; total: number }> {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
  const offset = (page - 1) * pageSize;

  const conditions: SQL[] = [isNull(subscriptions.deletedAt)];

  if (filters.status) {
    conditions.push(eq(subscriptions.status, filters.status));
  }

  if (filters.plan) {
    conditions.push(eq(subscriptions.plan, filters.plan));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(ilike(clinics.name, term));
  }

  const whereClause = and(...conditions);

  const rawRows = await db
    .select({
      id: subscriptions.id,
      clinicId: subscriptions.clinicId,
      clinicName: clinics.name,
      clinicStatus: clinics.status,
      plan: subscriptions.plan,
      status: subscriptions.status,
      billingCycle: subscriptions.billingCycle,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      createdAt: subscriptions.createdAt,
    })
    .from(subscriptions)
    .innerJoin(clinics, eq(subscriptions.clinicId, clinics.id))
    .where(whereClause)
    .orderBy(desc(subscriptions.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(subscriptions)
    .innerJoin(clinics, eq(subscriptions.clinicId, clinics.id))
    .where(whereClause);

  const total = countRow?.count ?? 0;

  return {
    rows: rawRows,
    total,
  };
}

export async function getSubscriptionSummary(): Promise<AdminSubscriptionSummary> {
  const statusRows = await db
    .select({
      status: subscriptions.status,
      count: sql<number>`count(*)::int`,
    })
    .from(subscriptions)
    .where(isNull(subscriptions.deletedAt))
    .groupBy(subscriptions.status);

  const planRows = await db
    .select({
      plan: subscriptions.plan,
      count: sql<number>`count(*)::int`,
    })
    .from(subscriptions)
    .where(isNull(subscriptions.deletedAt))
    .groupBy(subscriptions.plan);

  const byStatus: Record<SubscriptionStatus, number> = {
    trialing: 0,
    active: 0,
    past_due: 0,
    paused: 0,
    canceled: 0,
  };

  const byPlan: Record<SubscriptionPlan, number> = {
    starter: 0,
    professional: 0,
    enterprise: 0,
  };

  let total = 0;

  for (const row of statusRows) {
    const count = Number(row.count) || 0;
    total += count;
    if (row.status in byStatus) {
      byStatus[row.status as SubscriptionStatus] = count;
    }
  }

  for (const row of planRows) {
    const count = Number(row.count) || 0;
    if (row.plan in byPlan) {
      byPlan[row.plan as SubscriptionPlan] = count;
    }
  }

  return {
    total,
    byStatus,
    byPlan,
  };
}

export async function getSubscriptionByClinicId(
  clinicId: string,
): Promise<{ subscription: Subscription; clinic: Clinic } | null> {
  const [row] = await db
    .select({
      subscription: subscriptions,
      clinic: clinics,
    })
    .from(subscriptions)
    .innerJoin(clinics, eq(subscriptions.clinicId, clinics.id))
    .where(and(eq(subscriptions.clinicId, clinicId), isNull(subscriptions.deletedAt)))
    .limit(1);

  return row ?? null;
}

/**
 * Safely extracts only the event type and gateway subscription id from a webhook payload.
 * Walks jsonb records without exposing sensitive fields (email, phone, card, secrets).
 */
function extractEventDetails(payload: unknown): {
  eventType: string;
  gatewaySubscriptionId: string | null;
} {
  if (typeof payload !== 'object' || payload === null) {
    return { eventType: 'UNKNOWN', gatewaySubscriptionId: null };
  }

  const rec = payload as Record<string, unknown>;
  const data = typeof rec.data === 'object' && rec.data !== null ? (rec.data as Record<string, unknown>) : null;

  // Extract event type from standard Cashfree PG webhook formats
  const rawType = rec.type ?? rec.event ?? rec.event_type ?? data?.type ?? data?.event ?? data?.event_type;
  const eventType = typeof rawType === 'string' && rawType.trim() ? rawType : 'UNKNOWN';

  // Extract subscription ID (direct or nested)
  let gatewaySubscriptionId: string | null = null;

  const isSubKey = (k: string) => {
    const norm = k.toLowerCase().replace(/[-_]/g, '');
    return norm === 'subscriptionid' || norm === 'subreferenceid' || norm === 'cfsubscriptionid' || norm === 'subid';
  };

  const findId = (obj: Record<string, unknown>, depth: number): string | null => {
    if (depth > 4) return null;
    for (const [key, val] of Object.entries(obj)) {
      if (isSubKey(key) && typeof val === 'string' && val.trim()) {
        return val.trim();
      }
      if (typeof val === 'object' && val !== null) {
        const found = findId(val as Record<string, unknown>, depth + 1);
        if (found) return found;
      }
    }
    return null;
  };

  gatewaySubscriptionId = findId(rec, 1);

  return { eventType, gatewaySubscriptionId };
}

export async function listWebhookEvents(
  filters: ListWebhookEventsFilters,
): Promise<{ rows: WebhookEventListItem[]; total: number }> {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
  const offset = (page - 1) * pageSize;

  const conditions: SQL[] = [];

  if (filters.status) {
    conditions.push(eq(subscriptionWebhookEvents.status, filters.status));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rawRows = await db
    .select({
      id: subscriptionWebhookEvents.id,
      eventId: subscriptionWebhookEvents.eventId,
      payload: subscriptionWebhookEvents.payload,
      status: subscriptionWebhookEvents.status,
      processedAt: subscriptionWebhookEvents.processedAt,
    })
    .from(subscriptionWebhookEvents)
    .where(whereClause)
    .orderBy(desc(subscriptionWebhookEvents.processedAt))
    .limit(pageSize)
    .offset(offset);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(subscriptionWebhookEvents)
    .where(whereClause);

  const total = countRow?.count ?? 0;

  // Extract event details and collect gatewaySubscriptionIds
  const parsedItems = rawRows.map((r) => {
    const { eventType, gatewaySubscriptionId } = extractEventDetails(r.payload);
    return {
      id: r.id,
      eventId: r.eventId,
      status: r.status,
      processedAt: r.processedAt,
      eventType,
      gatewaySubscriptionId,
    };
  });

  const validGatewayIds = Array.from(
    new Set(
      parsedItems
        .map((item) => item.gatewaySubscriptionId)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const clinicMap = new Map<string, { clinicId: string; clinicName: string }>();

  if (validGatewayIds.length > 0) {
    const clinicRows = await db
      .select({
        gatewaySubscriptionId: subscriptions.cashfreeSubscriptionId,
        clinicId: clinics.id,
        clinicName: clinics.name,
      })
      .from(subscriptions)
      .innerJoin(clinics, eq(subscriptions.clinicId, clinics.id))
      .where(inArray(subscriptions.cashfreeSubscriptionId, validGatewayIds));

    for (const row of clinicRows) {
      if (row.gatewaySubscriptionId) {
        clinicMap.set(row.gatewaySubscriptionId, {
          clinicId: row.clinicId,
          clinicName: row.clinicName,
        });
      }
    }
  }

  const rows: WebhookEventListItem[] = parsedItems.map((item) => {
    const clinicMatch = item.gatewaySubscriptionId
      ? clinicMap.get(item.gatewaySubscriptionId)
      : undefined;

    return {
      id: item.id,
      eventId: item.eventId,
      status: item.status,
      processedAt: item.processedAt,
      eventType: item.eventType,
      gatewaySubscriptionId: item.gatewaySubscriptionId,
      clinicId: clinicMatch?.clinicId ?? null,
      clinicName: clinicMatch?.clinicName ?? null,
    };
  });

  return {
    rows,
    total,
  };
}

export async function countClinicsByPlan(): Promise<Record<string, number>> {
  const rows = await db
    .select({
      plan: subscriptions.plan,
      count: sql<number>`count(*)::int`,
    })
    .from(subscriptions)
    .where(isNull(subscriptions.deletedAt))
    .groupBy(subscriptions.plan);

  const result: Record<string, number> = {
    starter: 0,
    professional: 0,
    enterprise: 0,
  };

  for (const row of rows) {
    result[row.plan] = Number(row.count) || 0;
  }

  return result;
}
