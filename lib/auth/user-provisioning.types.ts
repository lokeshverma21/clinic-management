// /lib/auth/user-provisioning.types.ts

export interface ClerkUserEventData {
  id: string;
  email_addresses: { id: string; email_address: string }[];
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_numbers: { id: string; phone_number: string }[];
  primary_phone_number_id: string | null;
  public_metadata: Record<string, unknown>;
}

export interface ClerkUserDeletedData {
  id: string;
  deleted: boolean;
}

/**
 * The shape returned by Svix verification before we've looked at `type`.
 * Clerk sends many event types (session.*, organization.*, etc.) beyond
 * the three this app currently handles, so `data` starts as `unknown` and
 * is narrowed explicitly in the service layer's switch statement — an
 * open-ended discriminated union (with a `{ type: string }` catch-all
 * member) makes TypeScript's narrowing ambiguous instead of precise.
 */
export interface ClerkWebhookEvent {
  type: string;
  data: unknown;
}
