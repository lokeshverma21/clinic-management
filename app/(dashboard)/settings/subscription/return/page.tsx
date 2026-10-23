import Link from 'next/link';
import { subscriptionsService, returnQuerySchema } from '@/modules/subscriptions';
import { getRequestContext } from '@/lib/auth/request-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="mx-auto max-w-xl pt-4">
        <Card className="border-border/60 bg-card rounded-xl shadow-xs">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="flex items-center gap-2 text-destructive text-lg font-semibold">
              <AlertCircle className="size-5 shrink-0" />
              Invalid Session
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              No valid subscription session identifier was provided.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <Link
              href="/settings/subscription"
              className={cn(buttonVariants({ variant: "outline" }), "w-full text-xs h-9")}
            >
              Return to Subscription Settings
            </Link>
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
    <div className="mx-auto max-w-xl pt-4">
      <Card className="border-border/60 bg-card rounded-xl shadow-xs">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-foreground">
            {statusInfo.icon === 'success' && <CheckCircle2 className="size-5 text-success shrink-0" />}
            {statusInfo.icon === 'pending' && <Clock className="size-5 text-warning shrink-0" />}
            {statusInfo.icon === 'error' && <AlertCircle className="size-5 text-destructive shrink-0" />}
            {statusInfo.title}
          </CardTitle>
          <CardDescription className="text-sm text-foreground/80 mt-2 leading-relaxed">
            {statusInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <Link
            href="/settings/subscription"
            className={cn(buttonVariants({ variant: "default" }), "w-full text-xs h-9")}
          >
            Go to Subscription Settings
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
