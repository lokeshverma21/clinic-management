"use client"

import * as React from "react"
import { FileSpreadsheet, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"

interface BillingEmptyStateProps {
  onCreateInvoice: () => void
  readOnly?: boolean
}

export function BillingEmptyState({ onCreateInvoice, readOnly }: BillingEmptyStateProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-8">
      <DashboardEmptyState
        icon={FileSpreadsheet}
        title="No invoices yet"
        description="Create your first invoice to start tracking patient billing, payments, and revenue."
        action={
          !readOnly ? (
            <Button onClick={onCreateInvoice} className="gap-2 shadow-xs">
              <Plus className="size-4" />
              <span>New Invoice</span>
            </Button>
          ) : undefined
        }
      />
    </div>
  )
}
