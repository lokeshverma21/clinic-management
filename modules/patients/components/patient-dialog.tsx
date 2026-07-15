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
import { ScrollArea } from "@/components/ui/scroll-area"
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  patientId?: string | null;
  onSuccess?: (patient: Patient) => void;
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

    if (mode === 'edit' && patientId) {
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
      setFullName("")
      setPhone("")
      setEmail("")
      setDate(undefined)
      setGender("undisclosed")
      setNotes("")
      setError(null)
      setShowDuplicateWarning(false)
    }
  }, [open, mode, patientId])

  const checkDuplicate = async (phoneNumber: string) => {
    try {
      const res = await fetch(`/api/patients?search=${encodeURIComponent(phoneNumber)}&page=1&pageSize=20`)
      const json = await res.json()
      if (res.ok && json.data?.patients) {
        const list = json.data.patients as Patient[]
        // Match phone exactly and exclude current editing record
        return list.some(p => p.phone === phoneNumber && p.id !== patientId)
      }
    } catch {
      // Non-blocking, continue
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
      setError("Phone number must be in international format (e.g. +14155552671)")
      setIsSubmitting(false)
      return
    }

    if (mode === 'add' && !showDuplicateWarning) {
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

      const url = mode === 'add' ? "/api/patients" : `/api/patients/${patientId}`
      const method = mode === 'add' ? "POST" : "PATCH"

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
      <DialogContent className="sm:max-w-[500px] border-border/60 shadow-lg p-0 overflow-hidden rounded-xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">
            {mode === 'add' ? 'Add Patient' : 'Edit Patient'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Create a new patient record in the system.' 
              : 'Modify existing patient information.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[70vh]">
            <div className="grid gap-6 p-6 pt-4">
              {error && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg font-medium">
                  {error}
                </div>
              )}

              {showDuplicateWarning && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-800 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-semibold mb-1">Potential Duplicate</p>
                    <p className="mb-2">This phone number already exists for another patient. Shared household numbers are allowed.</p>
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] h-6 px-3"
                    >
                      Confirm & Save Anyway
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="fullName" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sarah Connor" 
                      className="pl-9 h-10 bg-background text-sm" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +14155552671" 
                        className="pl-9 h-10 bg-background text-sm" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email (Optional)</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. sarah.c@sky.net" 
                        className="pl-9 h-10 bg-background text-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date of Birth</Label>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-10 bg-background text-sm pl-9",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              {date ? format(date, "PPP") : <span>Pick a date</span>}
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gender</Label>
                    <Select value={gender} onValueChange={(val) => setGender(val ?? "undisclosed")}>
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

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes (Optional)</Label>
                  <div className="relative">
                    <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Textarea 
                      id="notes" 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Medical history, allergies, etc." 
                      className="pl-9 min-h-[100px] bg-background resize-none py-2.5 text-sm" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="bg-muted/30 p-6 pt-4 mt-0 border-t border-border/50">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="h-10 px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="h-10 px-6 bg-primary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : (mode === 'add' ? 'Create Patient' : 'Save Changes')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
