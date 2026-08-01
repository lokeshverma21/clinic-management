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
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { InvoiceStatusBadge } from "./invoice-status-badge"
import type { InvoiceWithDetails } from "../billing.types"

interface InvoiceDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
  onEdit: () => void;
  onRecordPayment: (invoice: InvoiceWithDetails) => void;
  onDuplicate: (invoiceId: string) => void;
  onDelete: (invoiceId: string) => void;
  onSuccess?: () => void;
  readOnly?: boolean;
  canDelete?: boolean;
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
  React.useEffect(() => {
    if (open) return

    const timeoutId = window.setTimeout(() => {
      setInvoice(null)
      setError(null)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [open])

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col h-full max-h-screen overflow-hidden">
        <SheetHeader className="p-6 pb-4 border-b border-border/50 shrink-0">
          <SheetTitle className="text-lg">Invoice Details</SheetTitle>
          <SheetDescription>
            {invoice ? invoice.invoiceNumber : "Loading invoice information..."}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-destructive">{error}</div>
        ) : invoice ? (
          <>
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <InvoiceStatusBadge status={invoice.status} />
                  <span className="text-xs text-muted-foreground">
                    Issued {format(new Date(invoice.issuedAt), "MMM d, yyyy")}
                  </span>
                </div>

                <div className="grid gap-3 text-sm">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{invoice.patient.fullName}</p>
                      <p className="text-xs text-muted-foreground">{invoice.patient.email ?? "No email"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{invoice.patient.phone}</span>
                  </div>
                  {invoice.doctor && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Dr. {invoice.doctor.fullName}</span>
                    </div>
                  )}
                  {invoice.dueAt && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Due {format(new Date(invoice.dueAt), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Line Items
                  </h4>
                  <div className="rounded-lg border border-border/60 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-xs">Description</TableHead>
                          <TableHead className="text-xs text-right">Qty</TableHead>
                          <TableHead className="text-xs text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-xs">{item.description}</TableCell>
                            <TableCell className="text-xs text-right">{item.quantity}</TableCell>
                            <TableCell className="text-xs text-right font-medium">
                              {formatINR(item.totalPrice)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatINR(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span>-{formatINR(invoice.discount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatINR(invoice.tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatINR(invoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Amount Paid</span>
                    <span>{formatINR(invoice.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between text-amber-600 font-medium">
                    <span>Balance Due</span>
                    <span>{formatINR(invoice.balanceDue)}</span>
                  </div>
                </div>

                {invoice.notes && (
                  <div className="flex gap-3 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <SheetFooter className="p-6 pt-4 border-t border-border/50 flex-col sm:flex-col gap-2 shrink-0 max-h-[45vh] overflow-y-auto">
              {error && (
                <p className="text-xs text-destructive text-center w-full">{error}</p>
              )}
              {canEdit && (
                <Button variant="outline" className="w-full gap-2" onClick={onEdit}>
                  <Pencil className="h-4 w-4" />
                  Edit Invoice
                </Button>
              )}
              {canPay && (
                <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => onRecordPayment(invoice)}>
                  <Wallet className="h-4 w-4" />
                  Record Payment
                </Button>
              )}
              {!readOnly && (
                <Button
                  variant="secondary"
                  className="w-full gap-2"
                  onClick={handleDuplicate}
                  disabled={duplicating}
                >
                  <Copy className="h-4 w-4" />
                  {duplicating ? "Duplicating..." : "Duplicate Invoice"}
                </Button>
              )}
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger>
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      disabled={deleting}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deleting ? "Deleting..." : "Delete Invoice"}
                    </Button>
                  </AlertDialogTrigger>
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