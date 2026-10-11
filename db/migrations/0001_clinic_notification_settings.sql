CREATE TABLE "clinic_notification_settings" (
	"clinic_id" uuid PRIMARY KEY NOT NULL,
	"auto_email_reminders_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clinic_notification_settings" ADD CONSTRAINT "clinic_notification_settings_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
