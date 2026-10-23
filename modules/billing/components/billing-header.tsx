"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"

interface BillingHeaderProps {
  onCreateInvoice: () => void
  readOnly?: boolean
}

export function BillingHeader({ onCreateInvoice, readOnly }: BillingHeaderProps) {
  return (
    <DashboardPageHeader
      title="Billing & Invoices"
      description="Create invoices, track payments, and manage clinic revenue."
    >
      {!readOnly && (
        <Button
          onClick={onCreateInvoice}
          className="gap-2 shadow-xs"
        >
          <Plus className="size-4" />
          <span>New Invoice</span>
        </Button>
      )}
    </DashboardPageHeader>
  )
}
