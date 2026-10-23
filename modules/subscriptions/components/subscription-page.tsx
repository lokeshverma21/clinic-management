"use client";

import * as React from "react";
import Script from "next/script";
import {
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Pause,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { StatusBadge } from "@/components/dashboard/dashboard-status-badge";
import { cn } from "@/lib/utils";
import type {
  Subscription,
  SubscriptionHistoryItem,
  SubscriptionPlanDetails,
  ManageAction,
} from "@/modules/subscriptions";

// --- Types & Interfaces (Unchanged) ---
interface CashfreeResult {
  error?: { message?: string };
}
interface CashfreeInstance {
  subscriptionsCheckout(options: {
    subsSessionId: string;
    redirectTarget: "_self";
  }): Promise<CashfreeResult>;
}
declare global {
  interface Window {
    Cashfree?: (options: {
      mode: "sandbox" | "production";
    }) => CashfreeInstance;
  }
}
type Payload = {
  subscription: Subscription | null;
  history: SubscriptionHistoryItem[];
  trialEndsAt?: string | Date | null;
};
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};

// UI Mapping for features (Logic friendly)
const PLAN_FEATURES: Record<string, { desc: string; features: string[]; popular?: boolean }> = {
  starter: {
    desc: "For a solo doctor replacing the paper register.",
    features: [
      "1 doctor, 2 staff seats",
      "Appointments & patient records",
      "WhatsApp confirmations",
      "Daily schedule view",
    ],
  },
  professional: {
    desc: "For clinics that live on their appointment book.",
    popular: true,
    features: [
      "Up to 5 doctors, 10 staff seats",
      "Automatic 24h + 1h WhatsApp reminders",
      "Invoices & basic billing",
      "Reports: revenue & no-shows",
      "Priority support",
    ],
  },
  enterprise: {
    desc: "For chains that need one view across locations.",
    features: [
      "Unlimited branches & staff",
      "Centralized reporting across clinics",
      "Role hierarchies per branch",
      "Dedicated onboarding",
      "Custom integrations",
    ],
  },
};

export function SubscriptionPage({ callback }: { callback?: boolean }) {
  const [plans, setPlans] = React.useState<SubscriptionPlanDetails[]>([]);
  const [data, setData] = React.useState<Payload | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<
    "starter" | "professional" | "pause" | "cancel" | "resume" | "uncancel" | null
  >(null);
  const [confirmAction, setConfirmAction] = React.useState<"pause" | "cancel" | null>(null);

  const load = React.useCallback(async () => {
    try {
      setError(null);
      const [planRes, currentRes] = await Promise.all([
        fetch("/api/subscriptions/plans"),
        fetch("/api/subscriptions/current"),
      ]);
      const planJson = (await planRes.json()) as ApiResponse<{
        plans: SubscriptionPlanDetails[];
      }>;
      const currentJson = (await currentRes.json()) as ApiResponse<Payload>;
      if (!planRes.ok || !currentRes.ok || !planJson.data || !currentJson.data)
        throw new Error(currentJson.error?.message ?? "Failed to load subscription details");
      setPlans(planJson.data.plans);
      setData(currentJson.data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to load subscription details");
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const start = async (plan: "starter" | "professional") => {
    try {
      setBusy(plan);
      setError(null);
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          plan,
          returnUrl: `${window.location.origin}/settings/subscription/return`,
        }),
      });
      const json = (await response.json()) as ApiResponse<{
        sessionId?: string;
        subscriptionSessionId?: string;
      }>;
      const subsSessionId = json.data?.subscriptionSessionId ?? json.data?.sessionId;
      if (!response.ok || !json.data || !subsSessionId)
        throw new Error(json.error?.message ?? "Could not start checkout");
      const factory = window.Cashfree;
      if (!factory) throw new Error("Cashfree checkout is still loading. Please try again.");
      const result = await factory({
        mode: process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "production" ? "production" : "sandbox",
      }).subscriptionsCheckout({
        subsSessionId,
        redirectTarget: "_self",
      });
      if (result.error) throw new Error(result.error.message ?? "Cashfree checkout could not be opened");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not start checkout");
    } finally {
      setBusy(null);
    }
  };

  const runManage = async (act: ManageAction) => {
    try {
      setBusy(act);
      setError(null);
      const response = await fetch("/api/subscriptions/manage", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: act }),
      });
      const json = (await response.json()) as ApiResponse<unknown>;
      if (!response.ok) throw new Error(json.error?.message ?? "Could not update subscription");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update subscription");
    } finally {
      setBusy(null);
      setConfirmAction(null);
    }
  };

  if (!data && !error) return <SubscriptionLoading />;
  if (error && !data) return <SubscriptionError message={error} onRetry={load} />;

  const subscription = data?.subscription ?? null;
  const isCancelledScheduled = Boolean(
    subscription?.cancelledAt &&
      subscription.currentPeriodEnd &&
      new Date(subscription.currentPeriodEnd) > new Date()
  );

  return (
    <>
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="afterInteractive" />
      <div className="space-y-6">
        <DashboardPageHeader
          title="Subscription & Billing"
          description="Manage your clinic's subscription tier, plan limits, and billing history."
        >
          {subscription && (
            <Badge variant="outline" className="px-2.5 py-1 text-xs font-medium border-primary/20 bg-primary/5">
              Current Plan: <span className="ml-1 capitalize font-semibold text-primary">{subscription.plan}</span>
            </Badge>
          )}
        </DashboardPageHeader>

        {callback && (
          <Alert className="border-primary/20 bg-primary/5 text-foreground">
            <CheckCircle2 className="size-4 text-primary" />
            <AlertTitle className="text-sm font-semibold">Authorization received</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground mt-1">
              {subscription?.status === "active"
                ? "Your subscription is active."
                : "We are confirming your mandate. This page will update shortly."}
            </AlertDescription>
          </Alert>
        )}

        {isCancelledScheduled && (
          <Alert className="border-warning/30 bg-warning/10 text-warning">
            <Clock3 className="size-4 text-warning" />
            <AlertTitle className="text-sm font-semibold text-foreground">
              Cancellation scheduled
            </AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
              <span className="text-xs text-muted-foreground">
                Your plan is set to cancel on{" "}
                <b className="text-foreground underline">
                  {subscription?.currentPeriodEnd
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN", { dateStyle: 'long' })
                    : "end of period"}
                </b>
                .
              </span>
              <Button
                size="sm"
                variant="outline"
                className="border-warning/40 text-foreground hover:bg-warning/10 shrink-0 h-8 text-xs"
                disabled={busy !== null}
                onClick={() => void runManage("uncancel")}
              >
                <RefreshCcw className="mr-1.5 size-3.5" />
                {busy === "uncancel" ? "Reactivating…" : "Keep Subscription"}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {subscription && (
          <Card className="rounded-xl border-border/60 bg-card p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <CreditCard className="size-5 text-primary" />
                  <h3 className="text-lg font-semibold capitalize tracking-tight text-foreground">
                    {subscription.plan} Plan
                  </h3>
                  <StatusBadge
                    type="subscription"
                    status={isCancelledScheduled ? "canceled" : subscription.status}
                    label={isCancelledScheduled ? "Expiring Soon" : undefined}
                  />
                </div>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {subscription.status === "trialing" && `Trial ends ${new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN")}`}
                  {subscription.status === "active" && !isCancelledScheduled && `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN")}`}
                  {subscription.status === "active" && isCancelledScheduled && `Access until ${new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN")}`}
                  {subscription.status === "paused" && `Paused since ${subscription.pausedAt ? new Date(subscription.pausedAt).toLocaleDateString("en-IN") : "recently"}`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {subscription.status === "paused" && (
                  <Button variant="default" size="sm" className="h-9 text-xs" disabled={busy !== null} onClick={() => void runManage("resume")}>
                    <RefreshCcw className="mr-1.5 size-3.5" />
                    {busy === "resume" ? "Resuming…" : "Resume Plan"}
                  </Button>
                )}
                {subscription.status === "active" && !isCancelledScheduled && (
                  <>
                    <Button variant="outline" size="sm" className="h-9 text-xs" disabled={busy !== null} onClick={() => setConfirmAction("pause")}>
                      <Pause className="mr-1.5 size-3.5" /> Pause
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 text-xs text-destructive hover:bg-destructive/10" disabled={busy !== null} onClick={() => setConfirmAction("cancel")}>
                      Cancel Plan
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">Choose the right plan for your clinic</h2>
            <p className="text-xs text-muted-foreground">Upgrade, adjust tiers, or switch billing preferences anytime.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const details = PLAN_FEATURES[plan.id] || { desc: "", features: [] };
              const isCurrent = subscription?.plan === plan.id && subscription.status !== "canceled";
              
              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col justify-between rounded-xl shadow-xs transition-colors",
                    isCurrent
                      ? "border-primary ring-1 ring-primary/30 bg-card"
                      : "border-border/60 bg-card hover:border-border"
                  )}
                >
                  <div>
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base font-semibold capitalize text-foreground">
                          {plan.name}
                        </CardTitle>
                        {isCurrent ? (
                          <Badge variant="outline" className="text-[11px] font-semibold border-primary/30 text-primary bg-primary/5">
                            Current
                          </Badge>
                        ) : details.popular ? (
                          <Badge variant="outline" className="text-[11px] font-semibold border-border bg-muted/60 text-muted-foreground">
                            Recommended
                          </Badge>
                        ) : null}
                      </div>
                      <CardDescription className="text-xs text-muted-foreground min-h-[32px] mt-1.5 leading-relaxed">
                        {details.desc}
                      </CardDescription>
                      <div className="pt-3 flex items-baseline gap-1">
                        <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                          {plan.amount === null
                            ? "Custom"
                            : new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                                maximumFractionDigits: 0,
                              }).format(plan.amount)}
                        </span>
                        {plan.amount !== null && (
                          <span className="text-xs text-muted-foreground font-normal">/ month</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-2">
                      <ul className="space-y-2 text-xs">
                        {details.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="size-3.5 text-primary mt-0.5 shrink-0" />
                            <span className="text-foreground/90">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </div>
                  <CardFooter className="p-5 pt-0">
                    {plan.selfServe ? (
                      <Button
                        className="w-full h-9 text-xs font-medium"
                        variant={details.popular && !isCurrent ? "default" : "outline"}
                        disabled={busy !== null || isCurrent}
                        onClick={() => void start(plan.id as "starter" | "professional")}
                      >
                        {busy === plan.id ? (
                          <RefreshCcw className="mr-1.5 size-3.5 animate-spin" />
                        ) : isCurrent ? (
                          "Current Plan"
                        ) : (
                          `Select ${plan.name}`
                        )}
                      </Button>
                    ) : (
                      <Button className="w-full h-9 text-xs font-medium" variant="outline" disabled>
                        Contact Sales
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight text-foreground">Billing History</h2>
          </div>
          <Card className="border-border/60 rounded-xl bg-card shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="h-10 border-b border-border/40">
                    <TableHead className="w-[240px] text-xs font-medium text-muted-foreground">Transaction ID</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-xs font-medium text-muted-foreground">Processed On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/40">
                  {data?.history.length ? (
                    data.history.map((event) => (
                      <TableRow key={event.eventId} className="h-12 hover:bg-muted/40 transition-colors">
                        <TableCell className="text-xs text-muted-foreground tabular-nums">
                          {event.eventId}
                        </TableCell>
                        <TableCell>
                          <StatusBadge type="subscription" status={event.status} />
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-xs tabular-nums">
                          {new Date(event.processedAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-1.5 py-6">
                           <Clock3 className="size-6 text-muted-foreground/40" />
                           <p className="text-xs text-muted-foreground">No billing events found.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>

      <AlertDialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent className="rounded-xl border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              {confirmAction === "cancel" ? "Schedule cancellation?" : "Pause subscription?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {confirmAction === "cancel"
                ? "Your subscription will remain active until the end of your current billing period. You'll lose access to premium features after that date."
                : "Your plan will be paused immediately. You can resume it anytime to pick up where you left off."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-9 text-xs">Go Back</AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                "h-9 text-xs",
                confirmAction === "cancel"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              )}
              onClick={() => confirmAction && void runManage(confirmAction)}
              disabled={busy !== null}
            >
              {busy ? "Processing..." : "Confirm Action"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// --- Loading & Error States ---

function SubscriptionLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-96 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function SubscriptionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="max-w-md mx-auto pt-12">
      <Card className="border-destructive/20 bg-destructive/5 rounded-xl shadow-xs">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="rounded-full bg-destructive/10 p-3 mb-3">
            <XCircle className="size-8 text-destructive" />
          </div>
          <h2 className="text-base font-semibold text-foreground">Failed to load subscription</h2>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{message}</p>
          <Button className="mt-6 h-9 text-xs" variant="outline" onClick={onRetry}>
            <RefreshCcw className="mr-1.5 size-3.5" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}