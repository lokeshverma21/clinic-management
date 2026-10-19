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
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { InvoiceWithDetails } from "@/modules/billing/billing.types"

interface PatientInvoicesListProps {
  invoices: InvoiceWithDetails[]
}

export function PatientInvoicesList({ invoices }: PatientInvoicesListProps) {
  const totalInvoiced = invoices.reduce((acc, inv) => acc + Number(inv.totalAmount || 0), 0)
  const totalPaid = invoices.reduce((acc, inv) => acc + Number(inv.amountPaid || 0), 0)
  const totalBalanceDue = invoices.reduce((acc, inv) => acc + Number(inv.balanceDue || 0), 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] py-0 px-2 h-4 font-normal">
            PAID
          </Badge>
        )
      case "partially_paid":
        return (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 text-[10px] py-0 px-2 h-4 font-normal">
            PARTIAL
          </Badge>
        )
      case "unpaid":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 text-[10px] py-0 px-2 h-4 font-normal">
            UNPAID
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="destructive" className="text-[10px] py-0 px-2 h-4 font-normal">
            OVERDUE
          </Badge>
        )
      case "cancelled":
      case "void":
        return (
          <Badge variant="outline" className="text-muted-foreground text-[10px] py-0 px-2 h-4 font-normal">
            {status.toUpperCase()}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-[10px] py-0 px-2 h-4 font-normal">
            {status.toUpperCase()}
          </Badge>
        )
    }
  }

  return (
    <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-xs space-y-4 p-4 sm:p-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="size-4 text-primary" />
            <span>Billing & Invoices</span>
            <Badge variant="secondary" className="text-xs px-2 py-0 h-5 font-medium ml-1">
              {invoices.length}
            </Badge>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Record of invoices, consultation charges, and payment balances for this patient.
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
        <div className="bg-muted/40 border border-border/50 rounded-lg p-3 space-y-1">
          <div className="text-xs text-muted-foreground font-medium">Total Invoiced</div>
          <div className="text-lg font-bold tracking-tight text-foreground">
            ${totalInvoiced.toFixed(2)}
          </div>
          <div className="text-[11px] text-muted-foreground">{invoices.length} invoices generated</div>
        </div>

        <div className="bg-muted/40 border border-border/50 rounded-lg p-3 space-y-1">
          <div className="text-xs text-muted-foreground font-medium">Total Paid</div>
          <div className="text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            ${totalPaid.toFixed(2)}
          </div>
          <div className="text-[11px] text-muted-foreground">Received payments</div>
        </div>

        <div className="bg-muted/40 border border-border/50 rounded-lg p-3 space-y-1">
          <div className="text-xs text-muted-foreground font-medium">Outstanding Balance</div>
          <div className={`text-lg font-bold tracking-tight ${
            totalBalanceDue > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
          }`}>
            ${totalBalanceDue.toFixed(2)}
          </div>
          <div className="text-[11px] text-muted-foreground">Current pending balance</div>
        </div>
      </div>

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-border/70 rounded-lg space-y-2">
          <div className="size-9 rounded-full bg-muted/80 flex items-center justify-center mx-auto text-muted-foreground">
            <Receipt className="size-4" />
          </div>
          <h3 className="text-sm font-medium text-foreground">No invoices generated yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Invoices created for this patient during consultations will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="border border-border/60 rounded-lg overflow-hidden bg-background">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold">Invoice #</TableHead>
                <TableHead className="text-xs font-semibold">Issued Date</TableHead>
                <TableHead className="text-xs font-semibold">Doctor</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-right text-xs font-semibold">Total Amount</TableHead>
                <TableHead className="text-right text-xs font-semibold">Balance Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-2.5 font-mono text-xs font-medium text-foreground">
                    {inv.invoiceNumber}
                  </TableCell>
                  <TableCell className="py-2.5 text-xs text-muted-foreground">
                    {format(new Date(inv.issuedAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="py-2.5 text-xs text-foreground">
                    {inv.doctor ? `Dr. ${inv.doctor.fullName}` : "Clinic"}
                  </TableCell>
                  <TableCell className="py-2.5">
                    {getStatusBadge(inv.status)}
                  </TableCell>
                  <TableCell className="py-2.5 text-right font-mono text-xs font-medium text-foreground">
                    ${Number(inv.totalAmount).toFixed(2)}
                  </TableCell>
                  <TableCell className="py-2.5 text-right font-mono text-xs font-medium">
                    <span className={Number(inv.balanceDue) > 0 ? "text-amber-600 dark:text-amber-400 font-semibold" : "text-muted-foreground"}>
                      ${Number(inv.balanceDue).toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
