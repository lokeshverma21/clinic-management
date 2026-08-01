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
import { format } from "date-fns"
import { InvoiceStatusBadge } from "./invoice-status-badge"
import type { InvoiceWithDetails } from "../billing.types"

interface BillingTableProps {
  invoices: InvoiceWithDetails[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewInvoice: (invoiceId: string) => void;
  onEditInvoice: (invoiceId: string) => void;
  onRecordPayment: (invoice: InvoiceWithDetails) => void;
  onDuplicateInvoice: (invoiceId: string) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  readOnly?: boolean;
  canDelete?: boolean;
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
      <div className="rounded-lg border border-border/60 p-8 text-center text-sm text-muted-foreground bg-card">
        No invoices found matching the selected filters.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-4 pl-6">Invoice #</TableHead>
              <TableHead className="py-4">Patient</TableHead>
              <TableHead className="py-4 hidden md:table-cell">Doctor</TableHead>
              <TableHead className="py-4 hidden lg:table-cell">Issued</TableHead>
              <TableHead className="py-4">Status</TableHead>
              <TableHead className="py-4 text-right">Total</TableHead>
              <TableHead className="py-4 text-right hidden sm:table-cell">Balance</TableHead>
              <TableHead className="w-[80px] text-right py-4 pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => onViewInvoice(invoice.id)}
                >
                  <TableCell className="py-4 pl-6 font-mono text-xs font-semibold">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="font-medium text-sm">{invoice.patient.fullName}</div>
                    <div className="text-xs text-muted-foreground">{invoice.patient.phone}</div>
                  </TableCell>
                  <TableCell className="py-4 hidden md:table-cell text-sm text-muted-foreground">
                    {invoice.doctor?.fullName ?? "—"}
                  </TableCell>
                  <TableCell className="py-4 hidden lg:table-cell text-sm text-muted-foreground">
                    {format(new Date(invoice.issuedAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="py-4">
                    <InvoiceStatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="py-4 text-right font-semibold text-sm">
                    {formatCurrency(invoice.totalAmount)}
                  </TableCell>
                  <TableCell className="py-4 text-right hidden sm:table-cell text-sm text-amber-600 font-medium">
                    {formatCurrency(invoice.balanceDue)}
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onViewInvoice(invoice.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {canEdit && (
                          <DropdownMenuItem onClick={() => onEditInvoice(invoice.id)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Invoice
                          </DropdownMenuItem>
                        )}
                        {canPay && (
                          <DropdownMenuItem onClick={() => onRecordPayment(invoice)}>
                            <Wallet className="mr-2 h-4 w-4" />
                            Record Payment
                          </DropdownMenuItem>
                        )}
                        {!readOnly && (
                          <DropdownMenuItem onClick={() => onDuplicateInvoice(invoice.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onDeleteInvoice(invoice.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {startRange}–{endRange} of {total} invoices
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
