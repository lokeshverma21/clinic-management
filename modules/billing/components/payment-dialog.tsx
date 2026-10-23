// modules/billing/components/payment-dialog.tsx
"use client"

import * as React from "react"
import { CreditCard, IndianRupee } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { InvoiceWithDetails } from "../billing.types"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: InvoiceWithDetails | null
  onSuccess?: () => void
}

export function PaymentDialog({ open, onOpenChange, invoice, onSuccess }: PaymentDialogProps) {
  const [amount, setAmount] = React.useState("")
  const [method, setMethod] = React.useState("Cash")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Sync initial state when open updates
  React.useEffect(() => {
    if (open && invoice) {
      const timeoutId = window.setTimeout(() => {
        setAmount(parseFloat(invoice.balanceDue).toFixed(2))
        setMethod(invoice.paymentMethod || "Cash")
        setError(null)
      }, 0)
      
      return () => window.clearTimeout(timeoutId)
    }
  }, [open, invoice])

  if (!invoice) return null

  const currentBalance = parseFloat(invoice.balanceDue)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const paymentVal = parseFloat(amount)
    if (isNaN(paymentVal) || paymentVal <= 0) {
      setError("Please enter a valid positive payment amount.")
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/billing/${invoice?.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountPaid: paymentVal, paymentMethod: method }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error?.message ?? "Failed to collect payment.")
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Internal Server Error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/60 rounded-xl shadow-lg flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b border-border/40 shrink-0">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Record Payment
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Collect payment for Invoice #{invoice.invoiceNumber}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="space-y-4 p-6">
              {error && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/25 p-3 rounded-lg font-medium leading-relaxed">
                  {error}
                </div>
              )}

              {/* Total Balance Due Information Display */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
                <span className="text-muted-foreground font-medium uppercase tracking-wider">
                  Total Balance Due
                </span>
                <span className="text-lg font-semibold text-warning tabular-nums">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(currentBalance)}
                </span>
              </div>

              {/* Input Amount */}
              <div className="space-y-1.5">
                <Label htmlFor="payment-amount" className="text-xs font-medium text-foreground">
                  Payment Amount (₹)
                </Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={currentBalance}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-9 h-9 bg-background text-sm font-semibold tabular-nums"
                    required
                  />
                </div>
              </div>

              {/* Method Option */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Payment Method</Label>
                <Select value={method} onValueChange={(val) => setMethod(val ?? "Cash")}>
                  <SelectTrigger className="h-9 text-xs bg-background" aria-label="Select payment method">
                    <div className="flex items-center gap-1.5 truncate">
                      <CreditCard className="size-3.5 text-muted-foreground" />
                      <SelectValue placeholder="Select Method" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-muted/30 p-4 border-t border-border/40 flex items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-9 text-xs"
            >
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}