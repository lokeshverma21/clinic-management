import { pgTable, uuid, text, timestamp, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';

/** Verified Cashfree events: this is both the immutable billing history and replay guard. */
export const subscriptionWebhookEvents = pgTable(
  'subscription_webhook_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: text('event_id').notNull(),
    payload: jsonb('payload').notNull(),
    status: text('status').notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({ eventIdUnique: uniqueIndex('subscription_webhook_events_event_id_unique').on(table.eventId) }),
);

export type SubscriptionWebhookEvent = typeof subscriptionWebhookEvents.$inferSelect;
export type NewSubscriptionWebhookEvent = typeof subscriptionWebhookEvents.$inferInsert;
