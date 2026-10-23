"use client"

import * as React from "react"
import { 
  User, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon,
  FileText,
  AlertCircle
} from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Patient } from "../patients.types"

interface PatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  patientId?: string | null
  onSuccess?: (patient: Patient) => void
}

export function PatientDialog({ 
  open, 
  onOpenChange, 
  mode, 
  patientId, 
  onSuccess 
}: PatientDialogProps) {
  const [fullName, setFullName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [gender, setGender] = React.useState<string>("undisclosed")
  const [notes, setNotes] = React.useState("")
  const [date, setDate] = React.useState<Date | undefined>()
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showDuplicateWarning, setShowDuplicateWarning] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return

    if (mode === "edit" && patientId) {
      async function loadPatient() {
        try {
          setIsSubmitting(true)
          setError(null)
          const res = await fetch(`/api/patients/${patientId}`)
          const json = await res.json()
          if (!res.ok) {
            throw new Error(json.error?.message ?? "Failed to load patient details")
          }
          const p = json.data.patient as Patient
          setFullName(p.fullName)
          setPhone(p.phone)
          setEmail(p.email ?? "")
          setDate(p.dateOfBirth ? new Date(p.dateOfBirth) : undefined)
          setGender(p.gender ?? "undisclosed")
          setNotes(p.notes ?? "")
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
          setIsSubmitting(false)
        }
      }
      loadPatient()
    } else {
      queueMicrotask(() => {
        setFullName("")
        setPhone("")
        setEmail("")
        setDate(undefined)
        setGender("undisclosed")
        setNotes("")
        setError(null)
        setShowDuplicateWarning(false)
      })
    }
  }, [open, mode, patientId])

  const checkDuplicate = async (phoneNumber: string) => {
    try {
      const res = await fetch(`/api/patients?search=${encodeURIComponent(phoneNumber)}&page=1&pageSize=20`)
      const json = await res.json()
      if (res.ok && json.data?.patients) {
        const list = json.data.patients as Patient[]
        return list.some(p => p.phone === phoneNumber && p.id !== patientId)
      }
    } catch {
      // Non-blocking
    }
    return false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validation: Phone format
    const cleanedPhone = phone.replace(/\s+/g, "")
    const phoneRegex = /^\+[1-9]\d{7,14}$/
    if (!phoneRegex.test(cleanedPhone)) {
      setError("Phone number must be in international format (e.g. +919876543210 or +14155552671)")
      setIsSubmitting(false)
      return
    }

    if (mode === "add" && !showDuplicateWarning) {
      const isDuplicate = await checkDuplicate(cleanedPhone)
      if (isDuplicate) {
        setShowDuplicateWarning(true)
        setIsSubmitting(false)
        return
      }
    }

    try {
      const bodyPayload = {
        fullName: fullName.trim(),
        phone: cleanedPhone,
        email: email.trim() || undefined,
        dateOfBirth: date ? format(date, "yyyy-MM-dd") : undefined,
        gender: gender === "undisclosed" ? undefined : gender,
        notes: notes.trim() || undefined,
      }

      const url = mode === "add" ? "/api/patients" : `/api/patients/${patientId}`
      const method = mode === "add" ? "POST" : "PATCH"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message ?? `Failed to ${mode} patient`)
      }

      onOpenChange(false)
      if (onSuccess) {
        onSuccess(result.data.patient)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden rounded-lg border-border/60 p-0 shadow-lg sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-border/40 p-5 pb-4">
          <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
            {mode === "add" ? "Add patient" : "Edit patient"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {mode === "add"
              ? "Create a new patient record in your clinic directory."
              : "Update demographic and contact details for this patient."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="space-y-4 p-5">
              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive leading-relaxed">
                  {error}
                </div>
              )}

              {showDuplicateWarning && (
                <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3.5 text-warning">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
                  <div className="text-xs leading-relaxed space-y-2">
                    <div>
                      <p className="font-semibold text-warning">Potential duplicate phone number</p>
                      <p className="text-muted-foreground mt-0.5">
                        This phone number already exists on another patient record. Shared family or household phone numbers are permitted.
                      </p>
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      className="h-7 bg-warning text-warning-foreground hover:bg-warning/90 px-3 text-xs"
                      disabled={isSubmitting}
                    >
                      Confirm and save anyway
                    </Button>
                  </div>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-medium text-foreground">
                  Full name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="h-10 bg-background pl-9 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-medium text-foreground">
                    Phone number <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+919876543210"
                      className="h-10 bg-background pl-9 text-sm tabular-nums"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">International format with country code</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-foreground">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="h-10 bg-background pl-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">Date of birth</Label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-10 bg-background text-sm tabular-nums",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4 text-muted-foreground shrink-0" />
                          {date ? format(date, "PPP") : <span>Pick date of birth</span>}
                        </Button>
                      }
                    />
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs font-medium text-foreground">
                    Gender
                  </Label>
                  <Select
                    value={gender}
                    onValueChange={(val) => setGender(val ?? "undisclosed")}
                  >
                    <SelectTrigger id="gender" className="h-10 bg-background text-sm">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="undisclosed">Undisclosed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-medium text-foreground">
                  Medical history or background notes
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 size-4 text-muted-foreground pointer-events-none" />
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Allergies, chronic conditions, or background notes..."
                    className="min-h-[90px] resize-none bg-background py-2 pl-9 text-sm border-border/60"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-border/40 bg-muted/30 p-4 flex flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 px-4 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 px-5 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : mode === "add"
                ? "Create patient"
                : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
