"use client"

import * as React from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"

interface BillingErrorProps {
  onRetry: () => void
}

export function BillingError({ onRetry }: BillingErrorProps) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8">
      <DashboardEmptyState
        icon={AlertCircle}
        title="Failed to load billing records"
        description="There was a problem communicating with the server. Please check your connection and try again."
        action={
          <Button onClick={onRetry} variant="outline" className="gap-2 shadow-xs">
            <RotateCcw className="size-4" />
            <span>Try again</span>
          </Button>
        }
      />
    </div>
  )
}
