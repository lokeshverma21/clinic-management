// modules/billing/components/payment-dialog.tsx
"use client"

import * as React from "react"
import { CreditCard, IndianRupee, Wallet } from "lucide-react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import type { InvoiceWithDetails } from "../billing.types"

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceWithDetails | null;
  onSuccess?: () => void;
}

export function PaymentDialog({ open, onOpenChange, invoice, onSuccess }: PaymentDialogProps) {
  const [amount, setAmount] = React.useState("")
  const [method, setMethod] = React.useState("Cash")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Sync initial state when open updates
  React.useEffect(() => {
    if (open && invoice) {
      // Defer state updates to prevent cascading render error
      const timeoutId = window.setTimeout(() => {
        setAmount(parseFloat(invoice.balanceDue).toFixed(2))
        setMethod(invoice.paymentMethod || "Cash")
        setError(null)
      }, 0)
      
      return () => window.clearTimeout(timeoutId)
    }
  }, [open, invoice])

  if (!invoice) return null;

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
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-border/50 rounded-xl shadow-lg flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-0 shrink-0">
          <DialogTitle className="text-lg flex items-center gap-2">
            <Wallet className="text-emerald-500" size={20} />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Record patient payments for Invoice <strong>{invoice.invoiceNumber}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <ScrollArea className="flex-1">
            <div className="grid gap-4 p-6">
              {error && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/25 p-3 rounded-lg font-medium">
                  {error}
                </div>
              )}

              {/* Total Balance Due Information Display */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/30 text-xs">
                <span className="text-muted-foreground font-semibold uppercase tracking-wider">Total Balance Due</span>
                <span className="text-lg font-bold text-amber-600 font-mono">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(currentBalance)}
                </span>
              </div>

              {/* Input Amount */}
              <div className="space-y-2">
                <Label htmlFor="payment-amount" className="text-xs font-semibold uppercase text-muted-foreground">
                  Payment Amount
                </Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={currentBalance}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 h-10 bg-background text-sm font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Method Option */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Payment Method</Label>
                <Select value={method} onValueChange={(val) => setMethod(val ?? "Cash")}>
                  <SelectTrigger className="h-10 text-sm bg-background">
                    <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select Method" />
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
          </ScrollArea>

          <DialogFooter className="bg-muted/30 p-6 pt-4 border-t border-border/50 flex items-center justify-end gap-2 shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10 text-xs px-5">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-10 text-xs px-5 bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting ? "Completing..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}