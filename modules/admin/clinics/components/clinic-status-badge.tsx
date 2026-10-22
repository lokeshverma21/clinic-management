"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import type { ClinicStatus } from "../clinics.types"

interface ClinicStatusBadgeProps {
  status: ClinicStatus;
}

export function ClinicStatusBadge({ status }: ClinicStatusBadgeProps) {
  switch (status) {
    case "active":
      return (
        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600/90 text-white font-mono text-[11px] capitalize">
          active
        </Badge>
      );
    case "trial":
      return (
        <Badge variant="secondary" className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-mono text-[11px] capitalize">
          trial
        </Badge>
      );
    case "past_due":
      return (
        <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-mono text-[11px] capitalize">
          past due
        </Badge>
      );
    case "suspended":
      return (
        <Badge variant="destructive" className="font-mono text-[11px] capitalize">
          suspended
        </Badge>
      );
    case "canceled":
      return (
        <Badge variant="outline" className="text-muted-foreground border-border/80 font-mono text-[11px] capitalize">
          canceled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="font-mono text-[11px] capitalize">
          {status}
        </Badge>
      );
  }
}
