"use client"

import * as React from "react"
import { Plus, Trash2, Search, Check } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import type { InvoiceWithDetails, InvoiceItemInput } from "../billing.types"
import type { Patient } from "@/modules/patients/patients.types"
import type { StaffListItem } from "@/modules/staff"

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  invoiceId?: string | null
  onSuccess?: () => void
}

const emptyItem = (): InvoiceItemInput => ({
  description: "",
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  tax: 0,
})

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value)
}

export function InvoiceDialog({
  open,
  onOpenChange,
  mode,
  invoiceId,
  onSuccess,
}: InvoiceDialogProps) {
  const [patients, setPatients] = React.useState<Patient[]>([])
  const [doctors, setDoctors] = React.useState<StaffListItem[]>([])
  const [patientId, setPatientId] = React.useState("")
  const [patientSearch, setPatientSearch] = React.useState("")
  const [patientPopoverOpen, setPatientPopoverOpen] = React.useState(false)
  const [doctorMembershipId, setDoctorMembershipId] = React.useState<string>("none")
  const [items, setItems] = React.useState<InvoiceItemInput[]>([emptyItem()])
  const [invoiceDiscount, setInvoiceDiscount] = React.useState("0")
  const [invoiceTax, setInvoiceTax] = React.useState("0")
  const [amountPaid, setAmountPaid] = React.useState("0")
  const [notes, setNotes] = React.useState("")
  const [paymentMethod, setPaymentMethod] = React.useState<string>("none")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isLocked, setIsLocked] = React.useState(false)

  // Load patients and doctors when dialog opens
  React.useEffect(() => {
    if (!open) return

    async function loadOptions() {
      try {
        const [patientsRes, staffRes] = await Promise.all([
          fetch("/api/patients?page=1&pageSize=100"),
          fetch("/api/staff"),
        ])
        const patientsJson = await patientsRes.json()
        const staffJson = await staffRes.json()

        if (patientsRes.ok && patientsJson.data?.patients) {
          setPatients(patientsJson.data.patients)
        }
        if (staffRes.ok && staffJson.data?.staff) {
          const staffList = staffJson.data.staff as StaffListItem[]
          setDoctors(
            staffList.filter(
              (s) => (s.role === "doctor" || s.role === "owner") && s.status === "active"
            )
          )
        }
      } catch (err) {
        console.error("Failed to load options", err)
      }
    }

    loadOptions()
  }, [open])

  // Load existing invoice for edit mode
  React.useEffect(() => {
    if (!open) {
      setPatientId("")
      setDoctorMembershipId("none")
      setItems([emptyItem()])
      setInvoiceDiscount("0")
      setInvoiceTax("0")
      setAmountPaid("0")
      setNotes("")
      setPaymentMethod("none")
      setError(null)
      setIsLocked(false)
      return
    }

    if (mode === "edit" && invoiceId) {
      async function loadInvoice() {
        try {
          const res = await fetch(`/api/billing/${invoiceId}`)
          const json = await res.json()
          if (!res.ok) throw new Error(json.error?.message ?? "Failed to load invoice")

          const inv: InvoiceWithDetails = json.data.invoice
          setPatientId(inv.patientId)
          setDoctorMembershipId(inv.doctorMembershipId ?? "none")
          setInvoiceDiscount(String(inv.discount))
          setInvoiceTax(String(inv.tax))
          setAmountPaid(String(inv.amountPaid))
          setNotes(inv.notes ?? "")
          setPaymentMethod(inv.paymentMethod ?? "none")
          setIsLocked(inv.status !== "draft")

          if (inv.items && inv.items.length > 0) {
            setItems(
              inv.items.map((it) => ({
                description: it.description,
                quantity: it.quantity,
                unitPrice: parseFloat(it.unitPrice),
                discount: parseFloat(it.discount),
                tax: parseFloat(it.tax),
              }))
            )
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load invoice")
        }
      }
      loadInvoice()
    }
  }, [open, mode, invoiceId])

  // Compute live totals matching the backend math
  const itemsSubtotal = round(
    items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0)
  )
  const itemsDiscount = round(
    items.reduce((sum, it) => sum + (it.discount ?? 0), 0)
  )
  const itemsTax = round(
    items.reduce((sum, it) => sum + (it.tax ?? 0), 0)
  )
  const parsedInvoiceDiscount = parseFloat(invoiceDiscount) || 0
  const parsedInvoiceTax = parseFloat(invoiceTax) || 0
  const parsedAmountPaid = parseFloat(amountPaid) || 0

  const totalDiscount = round(itemsDiscount + parsedInvoiceDiscount)
  const totalTax = round(itemsTax + parsedInvoiceTax)
  const grandTotal = Math.max(0, round(itemsSubtotal - totalDiscount + totalTax))
  const balanceDue = Math.max(0, round(grandTotal - parsedAmountPaid))

  const addItem = () => setItems((prev) => [...prev, emptyItem()])

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, patch: Partial<InvoiceItemInput>) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
    )
  }

  const selectedPatient = patients.find((p) => p.id === patientId)

  const filteredPatients = React.useMemo(() => {
    const q = patientSearch.toLowerCase().trim()
    if (!q) return patients
    return patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.email && p.email.toLowerCase().includes(q))
    )
  }, [patients, patientSearch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!patientId) {
      setError("Please select a patient.")
      return
    }

    if (items.length === 0 || items.some((it) => !it.description.trim())) {
      setError("All line items must have a description.")
      return
    }

    if (items.some((it) => it.quantity <= 0)) {
      setError("Item quantity must be at least 1.")
      return
    }

    try {
      setIsSubmitting(true)

      const payload = {
        patientId,
        doctorMembershipId:
          doctorMembershipId === "none" ? undefined : doctorMembershipId,
        items,
        discount: parsedInvoiceDiscount,
        tax: parsedInvoiceTax,
        amountPaid: parsedAmountPaid,
        paymentMethod: paymentMethod === "none" ? undefined : paymentMethod,
        notes: notes.trim() || undefined,
      }

      const url =
        mode === "edit" && invoiceId ? `/api/billing/${invoiceId}` : "/api/billing"
      const method = mode === "edit" ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Failed to save invoice")
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden border-border/60 rounded-xl p-0 shadow-lg sm:max-w-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-border/40 shrink-0">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {mode === "add" ? "New Invoice" : "Edit Invoice"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isLocked
              ? "This invoice is finalized and locked for editing."
              : mode === "add"
              ? "Draft a new invoice for patient consultations, procedures, or prescriptions."
              : "Update line items and amounts for this draft invoice."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="p-6 space-y-6">
              {error && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/25 p-3 rounded-lg font-medium leading-relaxed">
                  {error}
                </div>
              )}

              {/* Section 1: Patient and Doctor */}
              <div className="space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Patient & Practitioner
                </span>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Patient Picker */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">
                      Patient <span className="text-destructive">*</span>
                    </Label>
                    <Popover open={patientPopoverOpen} onOpenChange={setPatientPopoverOpen}>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="outline"
                            role="combobox"
                            disabled={isLocked || isSubmitting}
                            className={cn(
                              "w-full justify-between h-9 text-xs font-normal bg-background",
                              !patientId && "text-muted-foreground"
                            )}
                            aria-label="Select patient"
                          >
                            <span className="truncate">
                              {selectedPatient
                                ? `${selectedPatient.fullName} (${selectedPatient.phone})`
                                : "Select a patient..."}
                            </span>
                            <Search className="ml-2 size-3.5 shrink-0 opacity-50" />
                          </Button>
                        }
                      />
                      <PopoverContent className="w-[320px] p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search patient name or phone..."
                            value={patientSearch}
                            onValueChange={setPatientSearch}
                            className="h-9 text-xs"
                          />
                          <CommandList>
                            <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                              No patients found.
                            </CommandEmpty>
                            <CommandGroup>
                              {filteredPatients.map((p) => (
                                <CommandItem
                                  key={p.id}
                                  value={p.id}
                                  onSelect={() => {
                                    setPatientId(p.id)
                                    setPatientSearch("")
                                    setPatientPopoverOpen(false)
                                  }}
                                  className="text-xs"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 size-3.5",
                                      patientId === p.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-medium truncate text-foreground">{p.fullName}</span>
                                    <span className="text-xs text-muted-foreground tabular-nums">{p.phone}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Doctor Picker */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Doctor (Optional)</Label>
                    <Select
                      value={doctorMembershipId}
                      onValueChange={(val) => setDoctorMembershipId(val ?? "none")}
                      disabled={isLocked || isSubmitting}
                    >
                      <SelectTrigger className="h-9 bg-background text-xs" aria-label="Select doctor">
                        <SelectValue placeholder="No doctor assigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No doctor assigned</SelectItem>
                        {doctors.map((doc) => (
                          <SelectItem key={doc.membershipId} value={doc.membershipId} className="text-xs">
                            {doc.user?.fullName ?? doc.invitedEmail}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 2: Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Line Items
                  </span>
                  {!isLocked && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                      className="h-7 text-xs gap-1"
                    >
                      <Plus className="size-3" />
                      <span>Add item</span>
                    </Button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="grid gap-2 p-3 rounded-lg border border-border/60 bg-muted/20"
                    >
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Item description (e.g. General Consultation)"
                          value={item.description}
                          onChange={(e) => updateItem(index, { description: e.target.value })}
                          disabled={isLocked}
                          className="flex-1 h-9 text-xs bg-background"
                          required
                          aria-label={`Item ${index + 1} description`}
                        />
                        {!isLocked && items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(index)}
                            aria-label={`Remove item ${index + 1}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground font-medium uppercase">Qty</Label>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value, 10) || 1 })}
                            disabled={isLocked}
                            className="h-8 text-xs bg-background tabular-nums"
                            aria-label={`Item ${index + 1} quantity`}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground font-medium uppercase">Unit price (₹)</Label>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, { unitPrice: parseFloat(e.target.value) || 0 })}
                            disabled={isLocked}
                            className="h-8 text-xs bg-background tabular-nums"
                            aria-label={`Item ${index + 1} unit price`}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground font-medium uppercase">Discount (₹)</Label>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.discount ?? 0}
                            onChange={(e) => updateItem(index, { discount: parseFloat(e.target.value) || 0 })}
                            disabled={isLocked}
                            className="h-8 text-xs bg-background tabular-nums"
                            aria-label={`Item ${index + 1} discount`}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground font-medium uppercase">Tax (₹)</Label>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.tax ?? 0}
                            onChange={(e) => updateItem(index, { tax: parseFloat(e.target.value) || 0 })}
                            disabled={isLocked}
                            className="h-8 text-xs bg-background tabular-nums"
                            aria-label={`Item ${index + 1} tax`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Adjustments & Payment */}
              <div className="space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Invoice Adjustments & Payment
                </span>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Invoice Discount (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={invoiceDiscount}
                      onChange={(e) => setInvoiceDiscount(e.target.value)}
                      disabled={isLocked}
                      className="h-9 text-xs bg-background tabular-nums"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Invoice Tax (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={invoiceTax}
                      onChange={(e) => setInvoiceTax(e.target.value)}
                      disabled={isLocked}
                      className="h-9 text-xs bg-background tabular-nums"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Amount Paid (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      disabled={isLocked}
                      className="h-9 text-xs bg-background tabular-nums"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(val) => setPaymentMethod(val ?? "none")}
                    disabled={isLocked}
                  >
                    <SelectTrigger className="h-9 bg-background text-xs" aria-label="Payment method">
                      <SelectValue placeholder="Not specified" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Section 4: Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Notes & Instructions</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isLocked}
                  placeholder="Optional notes or payment instructions..."
                  className="min-h-[64px] resize-none text-xs bg-background"
                />
              </div>

              {/* Section 5: Totals Summary Block */}
              <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Items subtotal</span>
                  <span className="tabular-nums font-medium text-foreground">{formatINR(itemsSubtotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total discount</span>
                    <span className="tabular-nums font-medium text-foreground">-{formatINR(totalDiscount)}</span>
                  </div>
                )}
                {totalTax > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total tax</span>
                    <span className="tabular-nums font-medium text-foreground">+{formatINR(totalTax)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">Grand Total</span>
                  <span className="text-base font-semibold text-foreground tabular-nums">
                    {formatINR(grandTotal)}
                  </span>
                </div>
                {parsedAmountPaid > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>Amount paid</span>
                    <span className="tabular-nums font-medium text-foreground">{formatINR(parsedAmountPaid)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                  <span className="font-medium text-muted-foreground">Balance due</span>
                  <span className={cn("tabular-nums font-semibold", balanceDue > 0 ? "text-warning" : "text-muted-foreground")}>
                    {formatINR(balanceDue)}
                  </span>
                </div>
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
            {!isLocked && (
              <Button type="submit" size="sm" disabled={isSubmitting} className="h-9 text-xs">
                {isSubmitting ? "Saving..." : mode === "add" ? "Create Invoice" : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}