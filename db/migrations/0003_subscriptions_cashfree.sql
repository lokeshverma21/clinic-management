ALTER TYPE "public"."subscription_plan" RENAME VALUE 'growth' TO 'professional';--> statement-breakpoint
ALTER TYPE "public"."subscription_plan" RENAME VALUE 'multi_branch' TO 'enterprise';--> statement-breakpoint
ALTER TYPE "public"."subscription_status" ADD VALUE IF NOT EXISTS 'paused';--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cashfree_order_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cashfree_subscription_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "paused_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_cashfree_order_unique" ON "subscriptions" USING btree ("cashfree_order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_cashfree_subscription_unique" ON "subscriptions" USING btree ("cashfree_subscription_id");--> statement-breakpoint
CREATE TABLE "subscription_webhook_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_id" text NOT NULL,
  "payload" jsonb NOT NULL,
  "status" text NOT NULL,
  "processed_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_webhook_events_event_id_unique" ON "subscription_webhook_events" USING btree ("event_id");
