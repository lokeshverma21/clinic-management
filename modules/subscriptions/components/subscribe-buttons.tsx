'use client';
import { useState } from 'react';
import { load } from '@cashfreepayments/cashfree-js';

type PlanKey = 'starter' | 'professional';

interface CashfreeSubscriptionSdk {
  subscriptionsCheckout(options: {
    subsSessionId: string;
    redirectTarget?: '_self' | '_blank' | '_modal' | '_top';
  }): Promise<unknown>;
}

const OPTIONS: ReadonlyArray<{ key: PlanKey; name: string; price: string }> = [
  { key: 'starter', name: 'Starter', price: '₹999' },
  { key: 'professional', name: 'Professional', price: '₹2,499' },
];

interface ApiEnvelope {
  success?: boolean;
  data?: { subscriptionSessionId?: string; sessionId?: string };
  subscriptionSessionId?: string;
  error?: { message?: string };
}

export function SubscribeButtons() {
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(plan: PlanKey): Promise<void> {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const json = (await res.json()) as ApiEnvelope;
      const subsSessionId = json.data?.subscriptionSessionId ?? json.data?.sessionId ?? json.subscriptionSessionId;

      if (!res.ok || !subsSessionId) {
        throw new Error(json.error?.message ?? 'Could not start checkout');
      }

      const mode = process.env.NEXT_PUBLIC_CASHFREE_MODE === 'production' ? 'production' : 'sandbox';
      const sdk = await load({ mode });
      if (!sdk) throw new Error('Payment SDK failed to load');

      await (sdk as unknown as CashfreeSubscriptionSdk).subscriptionsCheckout({
        subsSessionId,
        redirectTarget: '_self',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {OPTIONS.map((o) => (
          <div key={o.key} className="rounded-xl border border-border/60 bg-card p-5 shadow-xs flex flex-col justify-between">
            <div>
              <p className="text-base font-semibold text-foreground">{o.name}</p>
              <p className="my-2 text-2xl font-semibold tabular-nums text-foreground">
                {o.price}
                <span className="text-xs font-normal text-muted-foreground"> /month</span>
              </p>
            </div>
            <button
              onClick={() => void subscribe(o.key)}
              disabled={loading !== null}
              className="w-full mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 h-9"
            >
              {loading === o.key ? 'Opening checkout…' : `Choose ${o.name}`}
            </button>
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  );
}