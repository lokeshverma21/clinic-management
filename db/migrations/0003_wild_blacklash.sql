ALTER TYPE "public"."subscription_status" ADD VALUE 'paused' BEFORE 'canceled';--> statement-breakpoint
CREATE TABLE "subscription_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "plan" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."subscription_plan";--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('starter', 'professional', 'enterprise');--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "plan" SET DATA TYPE "public"."subscription_plan" USING "plan"::"public"."subscription_plan";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cashfree_order_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cashfree_subscription_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "paused_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_webhook_events_event_id_unique" ON "subscription_webhook_events" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_cashfree_order_unique" ON "subscriptions" USING btree ("cashfree_order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_cashfree_subscription_unique" ON "subscriptions" USING btree ("cashfree_subscription_id");