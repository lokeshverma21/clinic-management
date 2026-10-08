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
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        {OPTIONS.map((o) => (
          <div key={o.key} className="rounded-lg border p-4">
            <p className="text-lg font-medium">{o.name}</p>
            <p className="mb-3 text-2xl">{o.price}<span className="text-sm"> /month</span></p>
            <button
              onClick={() => void subscribe(o.key)}
              disabled={loading !== null}
              className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              {loading === o.key ? 'Opening checkout…' : `Choose ${o.name}`}
            </button>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}