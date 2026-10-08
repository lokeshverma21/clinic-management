import Link from 'next/link';
import { subscriptionsService, returnQuerySchema } from '@/modules/subscriptions';
import { getRequestContext } from '@/lib/auth/request-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

function messageFor(cashfreeStatus: string): { title: string; description: string; icon: 'success' | 'pending' | 'error' } {
  switch (cashfreeStatus) {
    case 'ACTIVE':
      return {
        title: 'Subscription Active',
        description: 'Thank you! Your payment authorization was successful and your subscription is active.',
        icon: 'success',
      };
    case 'BANK_APPROVAL_PENDING':
    case 'INITIALIZED':
      return {
        title: 'Bank Authorization Pending',
        description: 'Your bank is confirming the authorization (up to 48 hours for eNACH). Your plan will activate automatically once confirmed.',
        icon: 'pending',
      };
    default:
      return {
        title: 'Authorization Incomplete',
        description: 'The payment authorization was not completed. You can try subscribing again from billing settings.',
        icon: 'error',
      };
  }
}

export default async function SubscriptionReturnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const parsed = returnQuerySchema.safeParse(params);

  if (!parsed.success) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Invalid Session
            </CardTitle>
            <CardDescription>
              No valid subscription session identifier was provided.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/settings/subscription">Return to Subscription Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ctx = await getRequestContext();
  const result = await subscriptionsService.syncSubscriptionForClinic(ctx.clinicId, ctx, parsed.data.sid);

  const statusInfo = result ? messageFor(result.cashfreeStatus) : {
    title: 'Status Verification Pending',
    description: 'We could not verify the checkout session. If you completed payment, your status will update automatically.',
    icon: 'pending' as const,
  };

  return (
    <div className="mx-auto max-w-xl p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {statusInfo.icon === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            {statusInfo.icon === 'pending' && <Clock className="h-5 w-5 text-amber-600" />}
            {statusInfo.icon === 'error' && <AlertCircle className="h-5 w-5 text-destructive" />}
            {statusInfo.title}
          </CardTitle>
          <CardDescription className="text-base text-foreground mt-2">
            {statusInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Button asChild className="w-full">
            <Link href="/settings/subscription">Go to Subscription Settings</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
