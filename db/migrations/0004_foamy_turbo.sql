CREATE TYPE "public"."clinic_suspension_source" AS ENUM('admin', 'billing');--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "suspension_source" "clinic_suspension_source";--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "past_due_since" timestamp with time zone;