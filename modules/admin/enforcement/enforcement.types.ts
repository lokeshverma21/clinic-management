// modules/admin/enforcement/enforcement.types.ts

export interface SubscriptionEnforcementResult {
  backfilledPastDue: number;
  suspendedPastDue: number;
  suspendedTrialExpired: number;
}
