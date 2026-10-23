"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import type { SubscriptionPlan } from "../subscriptions.types"

interface SubscriptionPlanBadgeProps {
  plan: SubscriptionPlan;
}

export function SubscriptionPlanBadge({ plan }: SubscriptionPlanBadgeProps) {
  switch (plan) {
    case "starter":
      return (
        <Badge variant="outline" className="font-mono text-[11px] uppercase border-border/80">
          Starter
        </Badge>
      );
    case "professional":
      return (
        <Badge variant="default" className="bg-primary/90 text-primary-foreground font-mono text-[11px] uppercase">
          Growth
        </Badge>
      );
    case "enterprise":
      return (
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30 font-mono text-[11px] uppercase">
          Enterprise
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="font-mono text-[11px] uppercase">
          {plan}
        </Badge>
      );
  }
}
