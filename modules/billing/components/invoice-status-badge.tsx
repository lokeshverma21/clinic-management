// modules/billing/components/invoice-status-badge.tsx
import * as React from "react"
import { StatusBadge, type InvoiceStatusValue } from "@/components/dashboard/dashboard-status-badge"

export type InvoiceStatus = InvoiceStatusValue

export interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
  className?: string
  dot?: boolean
}

/**
 * InvoiceStatusBadge
 *
 * Presentation wrapper around the dashboard StatusBadge.
 * Preserves the original component API and exports while delegating
 * to the centralized semantic token styling and sentence-case labels.
 */
export function InvoiceStatusBadge({ status, className, dot = false }: InvoiceStatusBadgeProps) {
  return (
    <StatusBadge
      type="invoice"
      status={status}
      className={className}
      dot={dot}
    />
  )
}
