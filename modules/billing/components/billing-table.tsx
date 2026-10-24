// modules/billing/components/billing-table.tsx
"use client"

import * as React from "react"
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Copy,
  Wallet,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { formatIstDate } from "@/lib/time/ist"
import { StatusBadge } from "@/components/dashboard/dashboard-status-badge"
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import type { InvoiceWithDetails } from "../billing.types"

interface BillingTableProps {
  invoices: InvoiceWithDetails[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onViewInvoice: (invoiceId: string) => void
  onEditInvoice: (invoiceId: string) => void
  onRecordPayment: (invoice: InvoiceWithDetails) => void
  onDuplicateInvoice: (invoiceId: string) => void
  onDeleteInvoice: (invoiceId: string) => void
  readOnly?: boolean
  canDelete?: boolean
}

function formatCurrency(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(num)
}

export function BillingTable({
  invoices,
  total,
  page,
  pageSize,
  onPageChange,
  onViewInvoice,
  onEditInvoice,
  onRecordPayment,
  onDuplicateInvoice,
  onDeleteInvoice,
  readOnly = false,
  canDelete = false,
}: BillingTableProps) {
  const startRange = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endRange = Math.min(page * pageSize, total)
  const totalPages = Math.ceil(total / pageSize) || 1

  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 bg-card p-8">
        <DashboardEmptyState
          icon={FileSpreadsheet}
          title="No invoices found"
          description="Try adjusting your filters or search terms."
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 overflow-hidden bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 text-xs font-medium text-muted-foreground pl-5">Invoice #</TableHead>
                <TableHead className="h-10 text-xs font-medium text-muted-foreground">Patient</TableHead>
                <TableHead className="h-10 text-xs font-medium text-muted-foreground hidden md:table-cell">Doctor</TableHead>
                <TableHead className="h-10 text-xs font-medium text-muted-foreground hidden lg:table-cell">Issued</TableHead>
                <TableHead className="h-10 text-xs font-medium text-muted-foreground">Status</TableHead>
                <TableHead className="h-10 text-xs font-medium text-muted-foreground text-right">Total</TableHead>
                <TableHead className="h-10 text-xs font-medium text-muted-foreground text-right hidden sm:table-cell">Balance</TableHead>
                <TableHead className="h-10 w-[60px] text-right pr-5"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/40">
              {invoices.map((invoice) => {
                const canEdit = !readOnly && invoice.status === "draft"
                const canPay =
                  !readOnly &&
                  invoice.status !== "draft" &&
                  invoice.status !== "cancelled" &&
                  invoice.status !== "void" &&
                  invoice.status !== "refunded" &&
                  parseFloat(invoice.balanceDue) > 0

                return (
                  <TableRow
                    key={invoice.id}
                    className="h-12 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onViewInvoice(invoice.id)}
                  >
                    <TableCell className="pl-5 text-xs font-medium text-foreground tabular-nums">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm text-foreground">{invoice.patient.fullName}</div>
                      <div className="text-xs text-muted-foreground tabular-nums">{invoice.patient.phone}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {invoice.doctor?.fullName ?? "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground tabular-nums">
                      {formatIstDate(invoice.issuedAt, "d MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="invoice" status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-foreground tabular-nums">
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-sm font-medium text-warning tabular-nums">
                      {formatCurrency(invoice.balanceDue)}
                    </TableCell>
                    <TableCell className="pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-foreground"
                              aria-label="Invoice actions"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => onViewInvoice(invoice.id)} className="gap-2 text-xs">
                            <Eye className="size-3.5 text-muted-foreground" />
                            <span>View details</span>
                          </DropdownMenuItem>
                          {canEdit && (
                            <DropdownMenuItem onClick={() => onEditInvoice(invoice.id)} className="gap-2 text-xs">
                              <Pencil className="size-3.5 text-muted-foreground" />
                              <span>Edit invoice</span>
                            </DropdownMenuItem>
                          )}
                          {canPay && (
                            <DropdownMenuItem onClick={() => onRecordPayment(invoice)} className="gap-2 text-xs">
                              <Wallet className="size-3.5 text-muted-foreground" />
                              <span>Record payment</span>
                            </DropdownMenuItem>
                          )}
                          {!readOnly && (
                            <DropdownMenuItem onClick={() => onDuplicateInvoice(invoice.id)} className="gap-2 text-xs">
                              <Copy className="size-3.5 text-muted-foreground" />
                              <span>Duplicate</span>
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2 text-xs text-destructive focus:text-destructive"
                                onClick={() => onDeleteInvoice(invoice.id)}
                              >
                                <Trash2 className="size-3.5" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground tabular-nums">
          Showing {startRange}–{endRange} of {total} invoices
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2 tabular-nums">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
