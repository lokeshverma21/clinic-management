import { pgTable, uuid, integer, timestamp, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { subscriptionPlanEnum, billingCycleEnum, subscriptionStatusEnum } from './enums';
import { clinics } from './clinics';

/**
 * Platform billing — what plan a clinic is on. Deliberately a separate
 * table from `invoices` (clinic → patient billing): Decision #11 in Part
 * 22 calls conflating the two "a class of billing logic bugs."
 */
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id, { onDelete: 'cascade' }),
    plan: subscriptionPlanEnum('plan').notNull(),
    staffSeatLimit: integer('staff_seat_limit').notNull(),
    billingCycle: billingCycleEnum('billing_cycle').notNull(),
    currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
    paymentProviderCustomerId: text('payment_provider_customer_id'),
    status: subscriptionStatusEnum('status').notNull().default('trialing'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // One active subscription per clinic
    clinicUnique: uniqueIndex('subscriptions_clinic_unique').on(table.clinicId),
  }),
);

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
