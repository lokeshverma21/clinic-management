// No top-level import/export here: that keeps this an ambient declaration
declare module '@cashfreepayments/cashfree-js' {
  export interface CashfreeLoadOptions {
    mode: 'sandbox' | 'production';
  }

  export interface CashfreeSubscriptionCheckoutOptions {
    subsSessionId: string;
    redirectTarget?: '_self' | '_blank' | '_modal' | '_top';
  }

  export interface CashfreeInstance {
    subscriptionsCheckout(options: CashfreeSubscriptionCheckoutOptions): Promise<unknown>;
  }

  export function load(options: CashfreeLoadOptions): Promise<CashfreeInstance | null>;
}