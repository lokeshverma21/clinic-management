"use client"

import * as React from "react"
import { CheckCircle2, Clock, AlertTriangle, Layers } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { AdminSubscriptionSummary } from "../subscriptions.types"

interface SubscriptionSummaryCardsProps {
  summary: AdminSubscriptionSummary;
}

export function SubscriptionSummaryCards({ summary }: SubscriptionSummaryCardsProps) {
  const atRiskCount = summary.byStatus.past_due + summary.byStatus.paused;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Active Subscriptions Card */}
      <Card className="shadow-none border-border/60">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Active Subscriptions</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {summary.byStatus.active}
          </div>
          <div className="text-xs text-muted-foreground">
            Paid & in good standing
          </div>
        </CardContent>
      </Card>

      {/* Trialing Subscriptions Card */}
      <Card className="shadow-none border-border/60">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Trialing</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {summary.byStatus.trialing}
          </div>
          <div className="text-xs text-muted-foreground">
            In onboarding trial period
          </div>
        </CardContent>
      </Card>

      {/* At-Risk Subscriptions Card */}
      <Card className="shadow-none border-border/60">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Past Due & Paused</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {atRiskCount}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>{summary.byStatus.past_due} past due</span>
            <span>·</span>
            <span>{summary.byStatus.paused} paused</span>
          </div>
        </CardContent>
      </Card>

      {/* Plan Distribution Card */}
      <Card className="shadow-none border-border/60">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Plan Distribution</span>
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {summary.total}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>{summary.byPlan.starter} Starter</span>
            <span>·</span>
            <span>{summary.byPlan.professional} Growth</span>
            <span>·</span>
            <span>{summary.byPlan.enterprise} Ent</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
