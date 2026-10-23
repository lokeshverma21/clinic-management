"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"

interface SubscriptionsHeaderProps {
  totalCount?: number;
}

export function SubscriptionsHeader({ totalCount }: SubscriptionsHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Subscriptions</h1>
          {typeof totalCount === "number" && (
            <Badge variant="secondary" className="font-mono text-xs">
              {totalCount} {totalCount === 1 ? "subscription" : "subscriptions"}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor all clinic SaaS subscriptions, recurring billing states, Cashfree webhook events, and plan tiers.
        </p>
      </div>
    </div>
  )
}
