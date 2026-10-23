// modules/billing/components/invoice-details-sheet.tsx
"use client"

import * as React from "react"
import {
  User,
  Phone,
  Calendar,
  FileText,
  Pencil,
  Trash2,
  Copy,
  Wallet,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { StatusBadge } from "@/components/dashboard/dashboard-status-badge"
import { DashboardDetailRow } from "@/components/dashboard/dashboard-detail-row"
import type { InvoiceWithDetails } from "../billing.types"

interface InvoiceDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: string | null
  onEdit: () => void
  onRecordPayment: (invoice: InvoiceWithDetails) => void
  onDuplicate: (invoiceId: string) => void
  onDelete: (invoiceId: string) => void
  onSuccess?: () => void
  readOnly?: boolean
  canDelete?: boolean
}

function formatINR(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(num)
}

export function InvoiceDetailsSheet({
  open,
  onOpenChange,
  invoiceId,
  onEdit,
  onRecordPayment,
  onDuplicate,
  onDelete,
  onSuccess,
  readOnly = false,
  canDelete = false,
}: InvoiceDetailsSheetProps) {
  const [invoice, setInvoice] = React.useState<InvoiceWithDetails | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [duplicating, setDuplicating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open || !invoiceId) return

    async function loadInvoice() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/billing/${invoiceId}`)
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error?.message ?? "Failed to fetch invoice details")
        }
        setInvoice(json.data.invoice)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = window.setTimeout(() => {
      void loadInvoice()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [open, invoiceId])

  // Clear state when closing
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setInvoice(null)
      setError(null)
    }
    onOpenChange(isOpen)
  }

  const handleDelete = async () => {
    if (!invoiceId) return
    try {
      setDeleting(true)
      setError(null)
      const res = await fetch(`/api/billing/${invoiceId}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Failed to delete invoice")
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setDeleting(false)
    }
  }

  const handleDuplicate = async () => {
    if (!invoiceId) return
    try {
      setDuplicating(true)
      setError(null)
      onDuplicate(invoiceId)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setDuplicating(false)
    }
  }

  // Exact role/permission conditions preserved from the existing code
  const canEdit = !readOnly && invoice?.status === "draft"
  const canPay =
    !readOnly &&
    invoice &&
    invoice.status !== "draft" &&
    invoice.status !== "cancelled" &&
    invoice.status !== "void" &&
    invoice.status !== "refunded" &&
    parseFloat(invoice.balanceDue) > 0

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col h-full max-h-screen overflow-hidden border-l border-border/60">
        <SheetHeader className="p-5 pb-4 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="text-xl font-semibold tracking-tight text-foreground">
              Invoice details
            </SheetTitle>
            {invoice && <StatusBadge type="invoice" status={invoice.status} />}
          </div>
          <SheetDescription className="text-xs text-muted-foreground tabular-nums">
            {invoice ? `Reference #${invoice.invoiceNumber}` : "Loading invoice information..."}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Loading invoice details...
          </div>
        ) : error ? (
          <div className="p-5 text-sm text-destructive bg-destructive/10 border border-destructive/20 m-5 rounded-lg">
            {error}
          </div>
        ) : invoice ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="p-5 space-y-6">
                {/* Meta details */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    General Information
                  </span>
                  <div className="space-y-2">
                    <DashboardDetailRow
                      label="Patient"
                      value={`${invoice.patient.fullName} (${invoice.patient.phone})`}
                      icon={User}
                    />
                    {invoice.patient.email && (
                      <DashboardDetailRow
                        label="Email"
                        value={invoice.patient.email}
                      />
                    )}
                    {invoice.doctor && (
                      <DashboardDetailRow
                        label="Doctor"
                        value={invoice.doctor.fullName}
                        icon={User}
                      />
                    )}
                    <DashboardDetailRow
                      label="Issued date"
                      value={format(new Date(invoice.issuedAt), "EEE d MMM yyyy")}
                      icon={Calendar}
                    />
                    {invoice.dueAt && (
                      <DashboardDetailRow
                        label="Payment due"
                        value={format(new Date(invoice.dueAt), "EEE d MMM yyyy")}
                        icon={Calendar}
                      />
                    )}
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Line Items */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Line Items
                  </span>
                  <div className="rounded-lg border border-border/60 overflow-hidden bg-card">
                    <Table>
                      <TableHeader className="bg-muted/50 border-b border-border/50">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="h-8 text-[11px] font-medium text-muted-foreground">Description</TableHead>
                          <TableHead className="h-8 text-[11px] font-medium text-muted-foreground text-right">Qty</TableHead>
                          <TableHead className="h-8 text-[11px] font-medium text-muted-foreground text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-border/40">
                        {invoice.items.map((item) => (
                          <TableRow key={item.id} className="hover:bg-muted/20">
                            <TableCell className="text-xs font-medium text-foreground py-2.5">
                              {item.description}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground text-right py-2.5 tabular-nums">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-foreground text-right py-2.5 tabular-nums">
                              {formatINR(item.totalPrice)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Totals Summary */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-medium text-foreground">{formatINR(invoice.subtotal)}</span>
                  </div>
                  {parseFloat(invoice.discount) > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Discount</span>
                      <span className="tabular-nums font-medium text-foreground">-{formatINR(invoice.discount)}</span>
                    </div>
                  )}
                  {parseFloat(invoice.tax) > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax</span>
                      <span className="tabular-nums font-medium text-foreground">+{formatINR(invoice.tax)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border/60 flex justify-between font-semibold text-sm text-foreground">
                    <span>Grand Total</span>
                    <span className="tabular-nums">{formatINR(invoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="tabular-nums font-medium text-success">{formatINR(invoice.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-border/40">
                    <span className="font-medium text-muted-foreground">Balance Due</span>
                    <span className="tabular-nums font-semibold text-warning">{formatINR(invoice.balanceDue)}</span>
                  </div>
                </div>

                {invoice.notes && (
                  <>
                    <Separator className="bg-border/50" />
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                        Notes
                      </span>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/40">
                        {invoice.notes}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <SheetFooter className="p-4 border-t border-border/40 flex-col sm:flex-col gap-2 shrink-0">
              {canEdit && (
                <Button variant="outline" size="sm" className="w-full gap-2 h-9 text-xs" onClick={onEdit}>
                  <Pencil className="size-3.5" />
                  <span>Edit Invoice</span>
                </Button>
              )}
              {canPay && (
                <Button size="sm" className="w-full gap-2 h-9 text-xs shadow-xs" onClick={() => onRecordPayment(invoice)}>
                  <Wallet className="size-3.5" />
                  <span>Record Payment</span>
                </Button>
              )}
              {!readOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 h-9 text-xs"
                  onClick={handleDuplicate}
                  disabled={duplicating}
                >
                  <Copy className="size-3.5" />
                  <span>{duplicating ? "Duplicating..." : "Duplicate Invoice"}</span>
                </Button>
              )}
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full gap-2 h-9 text-xs"
                        disabled={deleting}
                      >
                        <Trash2 className="size-3.5" />
                        <span>{deleting ? "Deleting..." : "Delete Invoice"}</span>
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will soft-delete invoice <strong>{invoice.invoiceNumber}</strong>. The record
                        will be hidden but retained for audit purposes. This action can only be reversed
                        by a database administrator.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDelete}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}