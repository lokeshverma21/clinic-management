"use client";

import * as React from "react";
import Script from "next/script";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Pause,
  RefreshCcw,
  XCircle,
  Zap,
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
import { Separator } from "@/components/ui/separator";
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

const statusStyle: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  trialing: "secondary",
  paused: "secondary",
  past_due: "destructive",
  canceled: "destructive",
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
      <div className="mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subscription & Billing</h1>
            <p className="text-muted-foreground">
              Manage your clinic&apos;s growth and billing preferences.
            </p>
          </div>
          {subscription && (
             <Badge variant="outline" className="w-fit px-3 py-1 text-sm font-medium border-primary/20 bg-primary/5">
                Current Plan: <span className="ml-1 capitalize text-primary">{subscription.plan}</span>
             </Badge>
          )}
        </div>

        {/* <Separator /> */}

        {callback && (
          <Alert className="border-primary/20 bg-primary/5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertTitle>Authorization received</AlertTitle>
            <AlertDescription>
              {subscription?.status === "active"
                ? "Your subscription is active."
                : "We are confirming your mandate. This page will update shortly."}
            </AlertDescription>
          </Alert>
        )}

        {isCancelledScheduled && (
          <Alert className="border-amber-500/20 bg-amber-500/5">
            <Clock3 className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-400 font-semibold">
              Cancellation scheduled
            </AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
              <span className="text-amber-900/90 dark:text-amber-300">
                Your plan is set to cancel on{" "}
                <b className="underline">
                  {subscription?.currentPeriodEnd
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN", { dateStyle: 'long' })
                    : "end of period"}
                </b>
                .
              </span>
              <Button
                size="sm"
                variant="outline"
                className="bg-white border-amber-500/30 text-amber-900 hover:bg-amber-100 shrink-0"
                disabled={busy !== null}
                onClick={() => void runManage("uncancel")}
              >
                <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                {busy === "uncancel" ? "Reactivating…" : "Keep Subscription"}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {subscription && (
          <Card className="overflow-hidden border-primary/1">
            <div className="p-6 md:flex items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <CreditCard className="h-5 w-5 text-primary" />
                   <h3 className="text-xl font-bold capitalize">{subscription.plan} Plan</h3>
                   <Badge
                    variant={isCancelledScheduled ? "outline" : statusStyle[subscription.status] ?? "outline"}
                    className={isCancelledScheduled ? "border-amber-500 text-amber-700" : ""}
                  >
                    {isCancelledScheduled ? "Expiring Soon" : subscription.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {subscription.status === "trialing" && `Trial ends ${new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN")}`}
                  {subscription.status === "active" && !isCancelledScheduled && `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN")}`}
                  {subscription.status === "active" && isCancelledScheduled && `Access until ${new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN")}`}
                  {subscription.status === "paused" && `Paused since ${subscription.pausedAt ? new Date(subscription.pausedAt).toLocaleDateString("en-IN") : "recently"}`}
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                {subscription.status === "paused" && (
                  <Button variant="default" size="sm" disabled={busy !== null} onClick={() => void runManage("resume")}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    {busy === "resume" ? "Resuming…" : "Resume Plan"}
                  </Button>
                )}
                {subscription.status === "active" && !isCancelledScheduled && (
                  <>
                    <Button variant="outline" size="sm" disabled={busy !== null} onClick={() => setConfirmAction("pause")}>
                      <Pause className="mr-2 h-4 w-4" /> Pause
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" disabled={busy !== null} onClick={() => setConfirmAction("cancel")}>
                      Cancel Plan
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-6 my-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Choose the right plan for your clinic</h2>
            <p className="text-muted-foreground">Upgrade or switch plans anytime.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const details = PLAN_FEATURES[plan.id] || { desc: "", features: [] };
              const isCurrent = subscription?.plan === plan.id && subscription.status !== "canceled";
              
              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col transition-all duration-300 ${
                    isCurrent ? "border-primary shadow-lg scale-[1.02]" : "border-border/60 hover:border-primary/50"
                  } ${details.popular ? "md:-mt-2 md:mb-2 border-primary/40" : ""}`}
                >
                  {details.popular && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Most Chosen
                    </div>
                  )}
                  <CardHeader className="pt-6">
                    <CardTitle className="flex items-center justify-between text-xl capitalize">
                      {plan.name}
                      {isCurrent && <Badge variant="secondary">Current</Badge>}
                    </CardTitle>
                    <CardDescription className="min-h-[40px] mt-2">{details.desc}</CardDescription>
                    <div className="pt-4">
                      <span className="text-3xl font-bold">
                        {plan.amount === null ? "Custom" : `₹${plan.amount.toLocaleString("en-IN")}`}
                      </span>
                      {plan.amount !== null && <span className="text-muted-foreground text-sm ml-1">/month</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2.5 text-sm">
                      {details.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {plan.selfServe ? (
                      <Button
                        className="w-full font-semibold"
                        variant={details.popular ? "default" : "outline"}
                        disabled={busy !== null || isCurrent}
                        onClick={() => void start(plan.id as "starter" | "professional")}
                      >
                        {busy === plan.id ? (
                          <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                        ) : isCurrent ? (
                          "Active Now"
                        ) : (
                          "Select Plan"
                        )}
                      </Button>
                    ) : (
                      <Button className="w-full" variant="outline" disabled>
                        Contact Sales
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Billing History</h2>
          </div>
          <Card className="border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[200px]">Transaction ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Processed On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.history.length ? (
                    data.history.map((event) => (
                      <TableRow key={event.eventId}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {event.eventId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize font-normal">
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
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
                        <div className="flex flex-col items-center justify-center gap-2">
                           <Clock3 className="h-8 w-8 opacity-20" />
                           <p>No billing events found.</p>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "cancel" ? "Schedule cancellation?" : "Pause subscription?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "cancel"
                ? "Your subscription will remain active until the end of your current billing period. You'll lose access to premium features after that date."
                : "Your plan will be paused immediately. You can resume it anytime to pick up where you left off."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              className={confirmAction === "cancel" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
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

// --- Loading & Error States (Enhanced UI) ---

function SubscriptionLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-28 w-full rounded-xl" />
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
    <div className="max-w-2xl mx-auto mt-20">
      <Card className="border-destructive/20 bg-destructive/5 shadow-lg">
        <CardContent className="flex flex-col items-center p-12 text-center">
          <div className="rounded-full bg-destructive/10 p-4 mb-4">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="mt-2 text-muted-foreground">{message}</p>
          <Button className="mt-8" variant="default" onClick={onRetry}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}