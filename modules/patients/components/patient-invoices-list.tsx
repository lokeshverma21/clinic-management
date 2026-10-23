"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Receipt, 
  CreditCard, 
  ExternalLink 
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { StatusBadge } from "@/components/dashboard/dashboard-status-badge"
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { InvoiceWithDetails } from "@/modules/billing/billing.types"

interface PatientInvoicesListProps {
  invoices: InvoiceWithDetails[]
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
})

export function PatientInvoicesList({ invoices }: PatientInvoicesListProps) {
  const totalInvoiced = invoices.reduce((acc, inv) => acc + Number(inv.totalAmount || 0), 0)
  const totalPaid = invoices.reduce((acc, inv) => acc + Number(inv.amountPaid || 0), 0)
  const totalBalanceDue = invoices.reduce((acc, inv) => acc + Number(inv.balanceDue || 0), 0)

  return (
    <div className="bg-card border border-border/60 rounded-lg overflow-hidden shadow-xs space-y-4 p-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="size-4 text-primary" />
            <span>Billing & Invoices</span>
            <Badge variant="secondary" className="text-xs px-2 py-0 h-5 font-medium ml-1 tabular-nums">
              {invoices.length}
            </Badge>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Record of invoices, consultation charges, and balances for this patient.
          </p>
        </div>

        <Link
          href="/billing"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 gap-1.5 text-xs self-start sm:self-auto")}
        >
          <CreditCard className="size-3.5 text-muted-foreground" />
          <span>Go to Billing</span>
          <ExternalLink className="size-3 ml-0.5 opacity-60" />
        </Link>
      </div>

      {/* Mini Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-muted/30 border border-border/50 rounded-lg p-3 space-y-1">
          <div className="text-xs text-muted-foreground font-medium">Total invoiced</div>
          <div className="text-xl font-semibold tracking-tight text-foreground tabular-nums">
            {inrFormatter.format(totalInvoiced)}
          </div>
          <div className="text-[11px] text-muted-foreground tabular-nums">{invoices.length} invoices generated</div>
        </div>

        <div className="bg-success/5 border border-success/20 rounded-lg p-3 space-y-1">
          <div className="text-xs text-success font-medium">Total received</div>
          <div className="text-xl font-semibold tracking-tight text-success tabular-nums">
            {inrFormatter.format(totalPaid)}
          </div>
          <div className="text-[11px] text-muted-foreground">Received payments</div>
        </div>

        <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 space-y-1">
          <div className="text-xs text-warning font-medium">Outstanding balance</div>
          <div className="text-xl font-semibold tracking-tight text-warning tabular-nums">
            {inrFormatter.format(totalBalanceDue)}
          </div>
          <div className="text-[11px] text-muted-foreground">Current pending balance</div>
        </div>
      </div>

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <DashboardEmptyState
          icon={Receipt}
          title="No invoices generated yet"
          description="Invoices created for this patient during consultations will automatically appear here."
          className="my-4"
        />
      ) : (
        <div className="border border-border/60 rounded-lg overflow-hidden bg-background">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent border-b border-border/60">
                  <TableHead className="text-xs font-medium text-muted-foreground py-3 pl-4">Invoice #</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground py-3">Issued date</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground py-3">Doctor</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground py-3">Status</TableHead>
                  <TableHead className="text-right text-xs font-medium text-muted-foreground py-3">Total amount</TableHead>
                  <TableHead className="text-right text-xs font-medium text-muted-foreground py-3 pr-4">Balance due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted/50 transition-colors border-b border-border/40 h-12">
                    <TableCell className="py-3 pl-4 text-xs font-medium text-foreground tabular-nums">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground tabular-nums">
                      {format(new Date(inv.issuedAt), "d MMM yyyy")}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-foreground">
                      {inv.doctor ? `Dr. ${inv.doctor.fullName}` : "Clinic"}
                    </TableCell>
                    <TableCell className="py-3">
                      <StatusBadge type="invoice" status={inv.status} />
                    </TableCell>
                    <TableCell className="py-3 text-right text-xs font-semibold text-foreground tabular-nums">
                      {inrFormatter.format(Number(inv.totalAmount))}
                    </TableCell>
                    <TableCell className="py-3 text-right text-xs font-semibold tabular-nums pr-4">
                      <span className={Number(inv.balanceDue) > 0 ? "text-warning" : "text-muted-foreground"}>
                        {inrFormatter.format(Number(inv.balanceDue))}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
