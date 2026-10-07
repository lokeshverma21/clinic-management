"use client";

import * as React from "react";
import Script from "next/script";
import {
    AlertCircle,
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
import type {
    Subscription,
    SubscriptionHistoryItem,
    SubscriptionPlanDetails,
} from "@/modules/subscriptions";

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

export function SubscriptionPage({ callback }: { callback?: boolean }) {
    const [plans, setPlans] = React.useState<SubscriptionPlanDetails[]>([]);
    const [data, setData] = React.useState<Payload | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [busy, setBusy] = React.useState<
        "starter" | "professional" | "pause" | "cancel" | null
    >(null);
    const [action, setAction] = React.useState<"pause" | "cancel" | null>(null);
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
            const currentJson =
                (await currentRes.json()) as ApiResponse<Payload>;
            if (
                !planRes.ok ||
                !currentRes.ok ||
                !planJson.data ||
                !currentJson.data
            )
                throw new Error(
                    currentJson.error?.message ??
                        "Failed to load subscription details",
                );
            setPlans(planJson.data.plans);
            setData(currentJson.data);
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "Failed to load subscription details",
            );
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
                sessionId: string;
            }>;
            if (!response.ok || !json.data)
                throw new Error(
                    json.error?.message ?? "Could not start checkout",
                );
            const factory = window.Cashfree;
            if (!factory)
                throw new Error(
                    "Cashfree checkout is still loading. Please try again.",
                );
            const result = await factory({
                mode:
                    process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT ===
                    "production"
                        ? "production"
                        : "sandbox",
            }).subscriptionsCheckout({
                subsSessionId: json.data.sessionId,
                redirectTarget: "_self",
            });
            if (result.error)
                throw new Error(
                    result.error.message ??
                        "Cashfree checkout could not be opened",
                );
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "Could not start checkout",
            );
        } finally {
            setBusy(null);
        }
    };
    const manage = async () => {
        if (!action) return;
        try {
            setBusy(action);
            const response = await fetch("/api/subscriptions/manage", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const json = (await response.json()) as ApiResponse<unknown>;
            if (!response.ok)
                throw new Error(
                    json.error?.message ?? "Could not update subscription",
                );
            await load();
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "Could not update subscription",
            );
        } finally {
            setBusy(null);
            setAction(null);
        }
    };
    if (!data && !error) return <SubscriptionLoading />;
    if (error && !data)
        return <SubscriptionError message={error} onRetry={load} />;
    const subscription = data?.subscription ?? null;
    return (
        <>
            <Script
                src="https://sdk.cashfree.com/js/v3/cashfree.js"
                strategy="afterInteractive"
            />
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Subscription
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your ClinicOS plan and billing status.
                    </p>
                </div>
                {callback && (
                    <Alert className="border-primary/20 bg-primary/5">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>Authorization received</AlertTitle>
                        <AlertDescription>
                            {subscription?.status === "active"
                                ? "Your subscription is active."
                                : "We are confirming your mandate. This page will update shortly."}
                        </AlertDescription>
                    </Alert>
                )}
                {subscription && (
                    <Card className="border-border/60 shadow-none">
                        <CardHeader className="flex-row items-start justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    {subscription.plan}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Renews{" "}
                                    {subscription.currentPeriodEnd
                                        .toString()
                                        .slice(0, 10)}
                                </CardDescription>
                            </div>
                            <Badge
                                variant={
                                    statusStyle[subscription.status] ??
                                    "outline"
                                }
                            >
                                {subscription.status.replace("_", " ")}
                            </Badge>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            {subscription.status === "active" && (
                                <Button
                                    variant="outline"
                                    onClick={() => setAction("pause")}
                                >
                                    <Pause className="mr-2 h-4 w-4" />
                                    Pause subscription
                                </Button>
                            )}
                            {!["canceled", "paused"].includes(
                                subscription.status,
                            ) && (
                                <Button
                                    variant="outline"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => setAction("cancel")}
                                >
                                    Cancel subscription
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
                {subscription?.status === "past_due" && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Payment needs attention</AlertTitle>
                        <AlertDescription>
                            Your clinic may become read-only if payment is not
                            resumed.
                        </AlertDescription>
                    </Alert>
                )}
                <div>
                    <h2 className="text-lg font-semibold">Choose a plan</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={
                                    subscription?.plan === plan.id
                                        ? "border-primary shadow-sm"
                                        : "border-border/60 shadow-none"
                                }
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        {plan.name}
                                        {subscription?.plan === plan.id && (
                                            <Badge>Current</Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        {plan.amount === null
                                            ? "Custom pricing"
                                            : `₹${plan.amount.toLocaleString("en-IN")} / month`}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {plan.staffSeatLimit && (
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            Up to {plan.staffSeatLimit} staff
                                            seats
                                        </p>
                                    )}
                                    {plan.selfServe ? (
                                        <Button
                                            className="w-full"
                                            disabled={
                                                busy !== null ||
                                                subscription?.plan === plan.id
                                            }
                                            onClick={() =>
                                                void start(
                                                    plan.id as
                                                        | "starter"
                                                        | "professional",
                                                )
                                            }
                                        >
                                            {busy === plan.id
                                                ? "Opening checkout…"
                                                : subscription?.plan === plan.id
                                                  ? "Current plan"
                                                  : "Choose plan"}
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            disabled
                                        >
                                            Contact sales
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="text-lg font-semibold">Billing history</h2>
                    <Card className="mt-4 border-border/60 shadow-none">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Processed
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.history.length ? (
                                    data.history.map((event) => (
                                        <TableRow key={event.eventId}>
                                            <TableCell className="font-mono text-xs">
                                                {event.eventId}
                                            </TableCell>
                                            <TableCell>
                                                {event.status}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {new Date(
                                                    event.processedAt,
                                                ).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No billing events yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
            <AlertDialog
                open={action !== null}
                onOpenChange={(open) => !open && setAction(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {action === "cancel"
                                ? "Cancel subscription?"
                                : "Pause subscription?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {action === "cancel"
                                ? "This ends recurring billing. You can continue until the current period ends."
                                : "Recurring billing will pause until you resume your plan."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep subscription</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => void manage()}
                            disabled={busy !== null}
                        >
                            {busy ? "Saving…" : "Confirm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
function SubscriptionLoading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-52" />
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                    <Skeleton key={item} className="h-52" />
                ))}
            </div>
            <Skeleton className="h-44" />
        </div>
    );
}
function SubscriptionError({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}) {
    return (
        <Card className="border-destructive/20 bg-destructive/5 shadow-none">
            <CardContent className="flex flex-col items-center p-12 text-center">
                <XCircle className="mb-4 h-8 w-8 text-destructive" />
                <h2 className="font-semibold">Couldn’t load subscription</h2>
                <p className="mt-2 text-sm text-muted-foreground">{message}</p>
                <Button className="mt-6" variant="outline" onClick={onRetry}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Retry
                </Button>
            </CardContent>
        </Card>
    );
}
