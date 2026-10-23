import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { CreditCard, Calendar, CheckCircle2, AlertTriangle, Key, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AdminClinicSubscriptionSummary, ClinicStatus } from "../clinics.types"

interface ClinicSubscriptionCardProps {
  subscription: AdminClinicSubscriptionSummary | null;
  clinicStatus: ClinicStatus;
  trialEndsAt: Date | null;
  clinicId?: string;
}

export function ClinicSubscriptionCard({
  subscription,
  clinicStatus,
  trialEndsAt,
  clinicId,
}: ClinicSubscriptionCardProps) {
  const isTrial = clinicStatus === "trial";
  const params = useParams<{ clinicId?: string }>();
  const effectiveClinicId = clinicId ?? params?.clinicId;

  return (
    <Card className="shadow-none border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span>SaaS Subscription & Plan</span>
          </CardTitle>
          {subscription ? (
            <Badge variant="outline" className="font-mono text-xs uppercase">
              {subscription.plan}
            </Badge>
          ) : (
            <Badge variant="secondary" className="font-mono text-xs">
              No Active Plan
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          Tenant subscription billing lifecycle via Cashfree gateway.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {subscription ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground block">Subscription Status</span>
              <div className="flex items-center gap-1.5 font-medium">
                {subscription.status === "active" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                )}
                <span className="capitalize text-foreground font-mono">{subscription.status}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground block">Billing Cadence</span>
              <span className="font-medium text-foreground capitalize font-mono">
                {subscription.billingCycle ?? "Monthly"}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground block">Current Period End</span>
              <div className="flex items-center gap-1.5 text-foreground font-mono">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  {subscription.currentPeriodEnd
                    ? format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy")
                    : "—"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground block">Gateway Subscription ID</span>
              <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                <Key className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-[180px]" title={subscription.cashfreeSubscriptionId ?? undefined}>
                  {subscription.cashfreeSubscriptionId ?? "—"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-2">
            <p>This clinic is currently on an unbilled trial or grandfathered platform access.</p>
            {isTrial && trialEndsAt && (
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                <span>Trial ends: {format(new Date(trialEndsAt), "MMMM d, yyyy")}</span>
              </div>
            )}
          </div>
        )}

        {subscription && effectiveClinicId && (
          <div className="pt-2 border-t border-border/50 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10 -mr-2"
              render={<Link href={`/admin/subscriptions/${effectiveClinicId}`} />}
            >
              <span>View subscription</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
