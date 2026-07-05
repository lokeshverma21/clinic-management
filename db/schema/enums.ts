import { pgEnum } from 'drizzle-orm/pg-core';

// clinics.status — drives whether background jobs run for a clinic (Part 2/6)
export const clinicStatusEnum = pgEnum('clinic_status', [
  'trial',
  'active',
  'past_due',
  'suspended',
  'canceled',
]);

// memberships.role — Part 8 covers the full permission mapping per role
export const membershipRoleEnum = pgEnum('membership_role', [
  'owner',
  'doctor',
  'receptionist',
]);

// memberships.status
export const membershipStatusEnum = pgEnum('membership_status', [
  'active',
  'invited',
  'deactivated',
]);

// patients.gender
export const genderEnum = pgEnum('gender', ['male', 'female', 'other', 'undisclosed']);

// appointments.status
export const appointmentStatusEnum = pgEnum('appointment_status', [
  'booked',
  'confirmed',
  'completed',
  'canceled',
  'no_show',
]);

// notifications.type
export const notificationTypeEnum = pgEnum('notification_type', [
  'confirmation',
  'reminder_24h',
  'reminder_1h',
  'cancellation',
]);

// notifications.channel — whatsapp only in V1, kept extensible per Part 10
export const notificationChannelEnum = pgEnum('notification_channel', [
  'whatsapp',
  'email',
  'sms',
  'push',
]);

// notifications.status
export const notificationStatusEnum = pgEnum('notification_status', [
  'scheduled',
  'sent',
  'delivered',
  'failed',
]);

// subscriptions.plan — clinic → platform billing (Part 6/9)
export const subscriptionPlanEnum = pgEnum('subscription_plan', [
  'starter',
  'growth',
  'multi_branch',
]);

// subscriptions.billing_cycle
export const billingCycleEnum = pgEnum('billing_cycle', ['monthly', 'yearly']);

// subscriptions.status
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'trialing',
  'active',
  'past_due',
  'canceled',
]);

// invoices.status — clinic → patient billing (Part 6/9), separate from subscriptions
export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'sent',
  'paid',
  'overdue',
  'void',
]);

// platform_users.role — NOT in the original blueprint; see platformUsers.ts for why
// this exists as its own table instead of a role on the tenant `users` table.
export const platformRoleEnum = pgEnum('platform_role', ['super_admin', 'support']);
