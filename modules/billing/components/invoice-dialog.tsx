"use client"

import * as React from "react"
import { Plus, Trash2, FileSpreadsheet, Search, Check, ChevronsUpDown } from "lucide-react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  invoiceId?: string | null;
  onSuccess?: () => void;
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
        if (patientsRes.ok) {
          setPatients(patientsJson.data?.patients ?? [])
        }
        if (staffRes.ok) {
          const list = (staffJson.data?.staff ?? []) as StaffListItem[]
          setDoctors(list.filter((d) => (d.role === "doctor" || d.role === "owner") && d.status === "active"))
        }
      } catch {
        // Non-blocking — user can still fill the form
      }
    }

    const t = window.setTimeout(() => {
      void loadOptions()
    }, 0)
    return () => window.clearTimeout(t)
  }, [open])

  // Load invoice data for edit mode
  React.useEffect(() => {
    if (!open) return

    const t = window.setTimeout(() => {
      if (mode === "edit" && invoiceId) {
        async function loadInvoice() {
          try {
            setIsSubmitting(true)
            setError(null)
            const res = await fetch(`/api/billing/${invoiceId}`)
            const json = await res.json()
            if (!res.ok) {
              throw new Error(json.error?.message ?? "Failed to load invoice")
            }
            const invoice = json.data.invoice as InvoiceWithDetails
            setIsLocked(invoice.status !== "draft")
            setPatientId(invoice.patientId)
            setDoctorMembershipId(invoice.doctorMembershipId ?? "none")
            setItems(
              invoice.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: parseFloat(item.unitPrice),
                discount: parseFloat(item.discount),
                tax: parseFloat(item.tax),
              })),
            )
            setInvoiceDiscount(invoice.discount)
            setInvoiceTax(invoice.tax)
            setAmountPaid(invoice.amountPaid)
            setNotes(invoice.notes ?? "")
            setPaymentMethod(invoice.paymentMethod ?? "none")
          } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong")
          } finally {
            setIsSubmitting(false)
          }
        }
        void loadInvoice()
      } else {
        // Reset for add mode
        setPatientId("")
        setPatientSearch("")
        setDoctorMembershipId("none")
        setItems([emptyItem()])
        setInvoiceDiscount("0")
        setInvoiceTax("0")
        setAmountPaid("0")
        setNotes("")
        setPaymentMethod("none")
        setError(null)
        setIsLocked(false)
      }
    }, 0)

    return () => window.clearTimeout(t)
  }, [open, mode, invoiceId])

  // Derived totals
  const subtotal = items.reduce((sum, item) => sum + round(item.quantity * item.unitPrice), 0)
  const itemDiscounts = items.reduce((sum, item) => sum + (item.discount ?? 0), 0)
  const itemTaxes = items.reduce((sum, item) => sum + (item.tax ?? 0), 0)
  const invDiscount = parseFloat(invoiceDiscount) || 0
  const invTax = parseFloat(invoiceTax) || 0
  const grandTotal = round(subtotal - (itemDiscounts + invDiscount) + (itemTaxes + invTax))

  // Patient search filter — client-side, works for up to 500 patients
  const filteredPatients = React.useMemo(() => {
    const q = patientSearch.toLowerCase().trim()
    if (!q) return patients
    return patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q),
    )
  }, [patients, patientSearch])

  const selectedPatient = patients.find((p) => p.id === patientId)

  function updateItem(index: number, patch: Partial<InvoiceItemInput>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()])
  }

  function removeItem(index: number) {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!patientId) {
      setError("Please select a patient.")
      return
    }

    const validItems = items.filter((item) => item.description.trim())
    if (validItems.length === 0) {
      setError("Add at least one line item with a description.")
      return
    }

    const payload = {
      patientId,
      doctorMembershipId: doctorMembershipId === "none" ? null : doctorMembershipId,
      discount: invDiscount,
      tax: invTax,
      amountPaid: parseFloat(amountPaid) || 0,
      notes: notes.trim() || null,
      paymentMethod: paymentMethod === "none" ? null : paymentMethod,
      items: validItems,
    }

    try {
      setIsSubmitting(true)
      const url = mode === "edit" && invoiceId ? `/api/billing/${invoiceId}` : "/api/billing"
      const method = mode === "edit" ? "PATCH" : "POST"
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
      <DialogContent className="sm:max-w-160 p-0 flex flex-col max-h-[95vh] overflow-y-scroll border-border/50 rounded-xl">
        <DialogHeader className="p-6 pb-0 shrink-0">
          <DialogTitle className="text-lg flex items-center gap-2">
            <FileSpreadsheet className="text-primary" size={20} />
            {mode === "add" ? "Create Invoice" : "Edit Invoice"}
          </DialogTitle>
          <DialogDescription>
            {isLocked
              ? "This invoice is finalized and cannot be edited structurally."
              : "Add line items and patient details. Totals are calculated automatically."}
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

              {isLocked ? (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  Only draft invoices can be edited. Use Record Payment or view details for finalized invoices.
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Patient — searchable combobox */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Patient *</Label>
                  <Popover open={patientPopoverOpen} onOpenChange={setPatientPopoverOpen}>
                    <PopoverTrigger>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={patientPopoverOpen}
                        className="w-full justify-between h-10 bg-background font-normal text-sm"
                        disabled={isLocked || isSubmitting}
                      >
                        {selectedPatient ? (
                          <span className="truncate">
                            {selectedPatient.fullName}
                            <span className="ml-1 text-muted-foreground text-xs">({selectedPatient.phone})</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Search patient…</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search by name or phone…"
                          value={patientSearch}
                          onValueChange={setPatientSearch}
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty className="py-4 text-center text-xs text-muted-foreground flex flex-col items-center gap-1">
                            <Search className="h-4 w-4 opacity-40" />
                            No patients found
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
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    patientId === p.id ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-medium truncate">{p.fullName}</span>
                                  <span className="text-xs text-muted-foreground">{p.phone}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Doctor */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Doctor</Label>
                  <Select
                    value={doctorMembershipId}
                    onValueChange={(val) => setDoctorMembershipId(val ?? "none")}
                    disabled={isLocked || isSubmitting}
                  >
                    <SelectTrigger className="h-10 bg-background">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No doctor assigned</SelectItem>
                      {doctors.map((doc) => (
                        <SelectItem key={doc.membershipId} value={doc.membershipId}>
                          {doc.user?.fullName ?? doc.invitedEmail}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Line Items</Label>
                  {!isLocked && (
                    <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-8 text-xs gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      Add Item
                    </Button>
                  )}
                </div>

                {items.map((item, index) => (
                  <div key={index} className="grid gap-2 p-3 rounded-lg border border-border/50 bg-muted/20">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(index, { description: e.target.value })}
                        disabled={isLocked}
                        className="flex-1 h-9 text-sm"
                        required
                      />
                      {!isLocked && items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0 text-destructive"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">Qty</span>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value, 10) || 1 })}
                          disabled={isLocked}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">Unit Price (₹)</span>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, { unitPrice: parseFloat(e.target.value) || 0 })}
                          disabled={isLocked}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">Discount (₹)</span>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          value={item.discount ?? 0}
                          onChange={(e) => updateItem(index, { discount: parseFloat(e.target.value) || 0 })}
                          disabled={isLocked}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">Tax (₹)</span>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          value={item.tax ?? 0}
                          onChange={(e) => updateItem(index, { tax: parseFloat(e.target.value) || 0 })}
                          disabled={isLocked}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Invoice-level adjustments */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Invoice Discount (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={invoiceDiscount}
                    onChange={(e) => setInvoiceDiscount(e.target.value)}
                    disabled={isLocked}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Invoice Tax (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={invoiceTax}
                    onChange={(e) => setInvoiceTax(e.target.value)}
                    disabled={isLocked}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Amount Paid (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    disabled={isLocked}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Payment Method</Label>
                <Select 
                  value={paymentMethod} 
                  onValueChange={(val) => setPaymentMethod(val ?? "none")} 
                  disabled={isLocked}
                >
                  <SelectTrigger className="h-9 bg-background">
                    <SelectValue placeholder="Optional" />
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

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isLocked}
                  placeholder="Optional notes for this invoice"
                  className="min-h-[72px] resize-none text-sm"
                />
              </div>

              {/* Grand Total display */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                <span className="text-sm font-semibold text-muted-foreground">Grand Total</span>
                <span className="text-xl font-bold text-primary">{formatINR(grandTotal)}</span>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="bg-muted/30 p-6 pt-4 border-t border-border/50 shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {!isLocked && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "add" ? "Create Invoice" : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}