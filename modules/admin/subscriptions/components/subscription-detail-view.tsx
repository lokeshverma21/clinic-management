"use client"

import * as React from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  CreditCard,
  ChevronLeft,
  Building2,
  Calendar,
  Users,
  Key,
  Info,
  Check,
  RotateCw,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SubscriptionStatusBadge } from "./subscription-status-badge"
import { SubscriptionPlanBadge } from "./subscription-plan-badge"
import { SubscriptionsError } from "./subscriptions-error"
import type { AdminSubscriptionDetail } from "../subscriptions.types"

interface SubscriptionDetailViewProps {
  clinicId: string;
}

export function SubscriptionDetailView({ clinicId }: SubscriptionDetailViewProps) {
  const [detail, setDetail] = React.useState<AdminSubscriptionDetail | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  const loadDetail = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage("")

      const res = await fetch(`/api/admin/subscriptions/${clinicId}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? "Failed to load subscription details")
      }

      setDetail(json.data)
    } catch (err: unknown) {
      console.error("Error loading subscription detail:", err)
      setHasError(true)
      setErrorMessage(err instanceof Error ? err.message : "Failed to load subscription detail")
    } finally {
      setIsLoading(false)
    }
  }, [clinicId])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      void loadDetail()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadDetail])

  if (isLoading && !detail) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-36 bg-muted rounded" />
        <div className="h-24 bg-card border rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-card border rounded-xl" />
          <div className="h-64 bg-card border rounded-xl" />
        </div>
      </div>
    );
  }

  if (hasError || !detail) {
    return <SubscriptionsError onRetry={loadDetail} message={errorMessage} />;
  }

  const { clinic, planDefinition } = detail;

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 -ml-2 text-xs text-muted-foreground gap-1"
          render={<Link href="/admin/subscriptions" />}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Subscriptions
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between bg-card p-6 rounded-xl border border-border/60">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-primary shrink-0" />
                <span>Subscription: {clinic.name}</span>
              </h1>
              <SubscriptionPlanBadge plan={detail.plan} />
              <SubscriptionStatusBadge status={detail.status} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="font-mono">/{clinic.slug}</span>
              <span className="capitalize">Clinic status: {clinic.status}</span>
              <span>Timezone: {clinic.timezone}</span>
              <Link
                href={`/admin/clinics/${detail.clinicId}`}
                className="text-primary inline-flex items-center gap-1 hover:underline font-medium"
              >
                <Building2 className="h-3 w-3" />
                <span>Go to Clinic Details</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadDetail}
            className="text-xs h-8 gap-1.5 self-start"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Admin Notice Callout */}
      <div className="flex items-center gap-2.5 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3.5 text-xs text-blue-800 dark:text-blue-200">
        <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <span>
          Gateway actions (pause/cancel) are not available from admin yet. Clinics manage their subscription directly via /settings/subscription.
        </span>
      </div>

      {/* Subscription Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Subscription Lifecycle & Periods */}
        <Card className="shadow-none border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>Subscription Details</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Billing period timings, cadence, and seat allocation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground block">Plan Tier</span>
                <span className="font-semibold text-foreground capitalize text-sm">
                  {detail.plan}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground block">Subscription Status</span>
                <div className="pt-0.5">
                  <SubscriptionStatusBadge status={detail.status} />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground block">Billing Cadence</span>
                <span className="font-mono text-foreground capitalize">
                  {detail.billingCycle}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground block">Staff Seat Limit</span>
                <div className="flex items-center gap-1.5 font-mono text-foreground">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{detail.staffSeatLimit} seats</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground block">Current Period Start</span>
                <div className="flex items-center gap-1.5 font-mono text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{format(new Date(detail.currentPeriodStart), "MMM d, yyyy")}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground block">Current Period End</span>
                <div className="flex items-center gap-1.5 font-mono text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{format(new Date(detail.currentPeriodEnd), "MMM d, yyyy")}</span>
                </div>
              </div>

              {detail.pausedAt && (
                <div className="space-y-1">
                  <span className="text-muted-foreground block">Paused At</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    {format(new Date(detail.pausedAt), "MMM d, yyyy")}
                  </span>
                </div>
              )}

              {detail.cancelledAt && (
                <div className="space-y-1">
                  <span className="text-muted-foreground block">Cancelled At</span>
                  <span className="font-mono text-destructive">
                    {format(new Date(detail.cancelledAt), "MMM d, yyyy")}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border/50">
              <span className="text-xs text-muted-foreground block mb-1">
                Gateway Subscription ID (Cashfree)
              </span>
              <div className="flex items-center gap-2 p-2 bg-muted/40 rounded border border-border/60 text-xs font-mono text-foreground">
                <Key className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{detail.cashfreeSubscriptionId ?? "None recorded"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Plan Definition & Feature Catalog */}
        <Card className="shadow-none border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span>Plan Definition</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Tier pricing, limits, and included platform capabilities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {planDefinition ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/60">
                  <div>
                    <span className="font-semibold text-sm text-foreground block">
                      {planDefinition.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {planDefinition.selfServe ? "Self-Serve Plan" : "Enterprise Sales"}
                    </span>
                  </div>
                  <div className="text-right">
                    {planDefinition.amount !== null ? (
                      <span className="font-bold text-base text-foreground">
                        ₹{planDefinition.amount.toLocaleString()}
                        <span className="text-xs font-normal text-muted-foreground"> / mo</span>
                      </span>
                    ) : (
                      <Badge variant="outline" className="font-mono text-xs">
                        Custom
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-medium text-foreground text-xs block">
                    Features Included in this Plan:
                  </span>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {planDefinition.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Custom or uncataloged plan configuration.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
