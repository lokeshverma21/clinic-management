ALTER TABLE "clinics" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "operating_hours" jsonb;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "onboarding_completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "invited_email" text;