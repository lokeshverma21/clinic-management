"use client"

import * as React from "react"
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  UserPlus,
  FileText,
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Patient } from "@/modules/patients"
import type { StaffListItem } from "@/modules/staff"
import type { AppointmentWithDetails } from "../appointment.types"
import { PatientDialog } from "@/modules/patients/components/patient-dialog"

interface AppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  appointment?: AppointmentWithDetails | null
  onSuccess?: () => void
}

type FormState = {
  patientId: string
  doctorMembershipId: string
  date: Date
  startTime: string
  endTime: string
  notes: string
}

type DataStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "ready"; patients: Patient[]; doctors: StaffListItem[] }
  | { type: "error"; message: string }

function buildInitialForm(
  mode: "add" | "edit",
  appointment?: AppointmentWithDetails | null,
): FormState {
  if (mode === "edit" && appointment) {
    const start = new Date(appointment.startTime)
    const end = new Date(appointment.endTime)
    return {
      patientId: appointment.patientId,
      doctorMembershipId: appointment.doctorMembershipId,
      date: start,
      startTime: format(start, "HH:mm"),
      endTime: format(end, "HH:mm"),
      notes: appointment.notes ?? "",
    }
  }
  return {
    patientId: "",
    doctorMembershipId: "",
    date: new Date(),
    startTime: "",
    endTime: "",
    notes: "",
  }
}

export function AppointmentDialog({
  open,
  onOpenChange,
  mode,
  appointment,
  onSuccess,
}: AppointmentDialogProps) {
  const [form, setForm] = React.useState<FormState>(() => buildInitialForm(mode, appointment))
  const [dataStatus, setDataStatus] = React.useState<DataStatus>({ type: "idle" })
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isAddPatientOpen, setIsAddPatientOpen] = React.useState(false)

  const [syncKey, setSyncKey] = React.useState("")
  const currentKey = open ? `${mode}-${appointment?.id ?? "new"}` : "closed"

  if (currentKey !== syncKey) {
    setSyncKey(currentKey)
    setForm(buildInitialForm(mode, appointment))
    setSubmitError(null)
    if (open) setDataStatus({ type: "loading" })
  }

  const setField = React.useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  )

  React.useEffect(() => {
    if (!open || dataStatus.type !== "loading") return

    let cancelled = false

    Promise.all([fetch("/api/patients?page=1&pageSize=100"), fetch("/api/staff")])
      .then(([patientsRes, staffRes]) =>
        Promise.all([patientsRes.json(), staffRes.json()]).then(([patientsJson, staffJson]) => ({
          patientsOk: patientsRes.ok,
          staffOk: staffRes.ok,
          patientsJson,
          staffJson,
        })),
      )
      .then(({ patientsOk, staffOk, patientsJson, staffJson }) => {
        if (cancelled) return

        if (!patientsOk || !staffOk) {
          throw new Error("Failed to load required data")
        }

        const activeDoctors = (
          (staffJson as { data: { staff: StaffListItem[] } }).data.staff
        ).filter((m) => m.role === "doctor" && m.status === "active")

        setDataStatus({
          type: "ready",
          patients: (patientsJson as { data: { patients: Patient[] } }).data.patients,
          doctors: activeDoctors,
        })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setDataStatus({
            type: "error",
            message: err instanceof Error ? err.message : "Failed to load data",
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [open, dataStatus.type])

  async function handleSubmit() {
    setSubmitError(null)

    if (!form.date) return setSubmitError("Please select a date")
    if (!form.startTime || !form.endTime) return setSubmitError("Please enter times")
    if (!form.patientId) return setSubmitError("Please select a patient")
    if (!form.doctorMembershipId) return setSubmitError("Please select a doctor")

    const [startHour, startMin] = form.startTime.split(":").map(Number)
    const [endHour, endMin] = form.endTime.split(":").map(Number)

    const start = new Date(form.date)
    start.setHours(startHour, startMin, 0, 0)

    const end = new Date(form.date)
    end.setHours(endHour, endMin, 0, 0)

    if (end <= start) return setSubmitError("End time must be after start time")

    const bodyPayload =
      mode === "add"
        ? {
            patientId: form.patientId,
            doctorMembershipId: form.doctorMembershipId,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            notes: form.notes.trim() || undefined,
          }
        : {
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            notes: form.notes.trim() || null,
          }

    try {
      setIsSubmitting(true)
      const res = await fetch(
        mode === "add" ? "/api/appointments" : `/api/appointments/${appointment?.id}`,
        {
          method: mode === "add" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload),
        },
      )
      const result = await res.json()
      if (!res.ok) throw new Error(result.error?.message ?? "Operation failed")

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  const patients = dataStatus.type === "ready" ? dataStatus.patients : []
  const doctors = dataStatus.type === "ready" ? dataStatus.doctors : []
  const isLoadingData = dataStatus.type === "loading"
  const dataError = dataStatus.type === "error" ? dataStatus.message : null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] border-border/60 shadow-lg p-0 overflow-hidden rounded-xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl">
              {mode === "edit" ? "Edit Appointment" : "Book Appointment"}
            </DialogTitle>
            <DialogDescription>
              {mode === "edit" ? "Modify schedule details." : "Schedule a new appointment."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-0 max-h-[70vh]">
            <div className="grid gap-6 p-6">
              {(submitError || dataError) && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg font-medium">
                  {submitError || dataError}
                </div>
              )}

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Patient</Label>
                  <div className="flex gap-2">
                    <Select
                      value={form.patientId}
                      onValueChange={(val) => setField("patientId", val ?? "")}
                      disabled={mode === "edit"}
                    >
                      <SelectTrigger className="h-10 bg-background flex-1 text-sm">
                        <SelectValue placeholder={isLoadingData ? "Loading..." : "Select patient"} />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={p.id} label={`${p.fullName} (${p.phone})`}>
                            {p.fullName} ({p.phone})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {mode === "add" && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0"
                        onClick={() => setIsAddPatientOpen(true)}
                      >
                        <UserPlus size={18} className="text-primary" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Doctor</Label>
                  <Select
                    value={form.doctorMembershipId}
                    onValueChange={(val) => setField("doctorMembershipId", val ?? "")}
                    disabled={mode === "edit"}
                  >
                    <SelectTrigger className="h-10 bg-background text-sm">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={isLoadingData ? "Loading..." : "Select doctor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doc) => (
                        <SelectItem key={doc.membershipId} value={doc.membershipId}>
                          {doc.user ? doc.user.fullName : doc.invitedEmail}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Date</Label>
                    <Popover>
                      <PopoverTrigger>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-10 bg-background text-sm",
                            !form.date && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {form.date ? format(form.date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.date}
                          onSelect={(d) => setField("date", d ?? new Date())}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase text-muted-foreground">Start</Label>
                      <div className="relative">
                        <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          value={form.startTime}
                          onChange={(e) => setField("startTime", e.target.value)}
                          className="pl-9 h-10 bg-background text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase text-muted-foreground">End</Label>
                      <div className="relative">
                        <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          value={form.endTime}
                          onChange={(e) => setField("endTime", e.target.value)}
                          className="pl-9 h-10 bg-background text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Notes</Label>
                  <div className="relative">
                    <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      value={form.notes}
                      onChange={(e) => setField("notes", e.target.value)}
                      placeholder="Reason for visit..."
                      className="pl-9 min-h-[100px] bg-background resize-none py-2.5 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="bg-muted/30 p-6 pt-4 mt-0 border-t border-border/50">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10 px-6">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoadingData}
              className="h-10 px-6 bg-primary"
            >
              {isSubmitting ? "Processing..." : mode === "edit" ? "Save Changes" : "Book Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PatientDialog
        open={isAddPatientOpen}
        onOpenChange={setIsAddPatientOpen}
        mode="add"
        onSuccess={(newPatient) => {
          setDataStatus((prev) =>
            prev.type === "ready" ? { ...prev, patients: [...prev.patients, newPatient] } : prev,
          )
          setField("patientId", newPatient.id)
        }}
      />
    </>
  )
}