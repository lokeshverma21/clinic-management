"use client"

import * as React from "react"
import {
  Calendar as CalendarIcon,
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { DashboardTimePicker } from "@/components/dashboard/dashboard-time-picker"
import { DashboardPatientCombobox } from "@/components/dashboard/dashboard-patient-combobox"
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
  initialPatientId?: string
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
  initialPatientId?: string,
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
    patientId: initialPatientId ?? "",
    doctorMembershipId: "",
    date: new Date(),
    startTime: "09:00",
    endTime: "09:30",
    notes: "",
  }
}

export function AppointmentDialog({
  open,
  onOpenChange,
  mode,
  appointment,
  initialPatientId,
  onSuccess,
}: AppointmentDialogProps) {
  const [form, setForm] = React.useState<FormState>(() =>
    buildInitialForm(mode, appointment, initialPatientId)
  )
  const [dataStatus, setDataStatus] = React.useState<DataStatus>({ type: "idle" })
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isAddPatientOpen, setIsAddPatientOpen] = React.useState(false)

  const [syncKey, setSyncKey] = React.useState("")
  const currentKey = open
    ? `${mode}-${appointment?.id ?? initialPatientId ?? "new"}`
    : "closed"

  if (currentKey !== syncKey) {
    setSyncKey(currentKey)
    setForm(buildInitialForm(mode, appointment, initialPatientId))
    setSubmitError(null)
    if (open) setDataStatus({ type: "loading" })
  }

  const setField = React.useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  )

  React.useEffect(() => {
    if (!open || dataStatus.type !== "loading") return

    let cancelled = false

    Promise.all([fetch("/api/patients?page=1&pageSize=100"), fetch("/api/staff")])
      .then(([patientsRes, staffRes]) =>
        Promise.all([patientsRes.json(), staffRes.json()]).then(
          ([patientsJson, staffJson]) => ({
            patientsOk: patientsRes.ok,
            staffOk: staffRes.ok,
            patientsJson,
            staffJson,
          })
        )
      )
      .then(({ patientsOk, staffOk, patientsJson, staffJson }) => {
        if (cancelled) return

        if (!patientsOk || !staffOk) {
          throw new Error("Failed to load required data")
        }

        const activeDoctors = (
          (staffJson as { data: { staff: StaffListItem[] } }).data.staff
        ).filter(
          (m) => (m.role === "doctor" || m.role === "owner") && m.status === "active"
        )

        setDataStatus({
          type: "ready",
          patients: (patientsJson as { data: { patients: Patient[] } }).data
            .patients,
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
    if (!form.startTime || !form.endTime) return setSubmitError("Please enter start and end times")
    if (!form.patientId) return setSubmitError("Please select a patient")
    if (!form.doctorMembershipId) return setSubmitError("Please select an attending doctor")

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
        }
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
        <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden rounded-lg border-border/60 p-0 shadow-lg sm:max-w-lg">
          <DialogHeader className="p-5 pb-4 border-b border-border/40 shrink-0">
            <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "edit" ? "Edit appointment" : "New appointment"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {mode === "edit"
                ? "Update consultation schedule details."
                : "Schedule a patient consultation with an attending doctor."}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="space-y-4 p-5">
              {(submitError || dataError) && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg font-medium leading-relaxed">
                  {submitError || dataError}
                </div>
              )}

              {/* Patient Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Patient <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <DashboardPatientCombobox
                      value={form.patientId}
                      onChange={(val) => setField("patientId", val)}
                      disabled={mode === "edit"}
                      initialLabel={
                        appointment?.patient
                          ? `${appointment.patient.fullName} (${appointment.patient.phone})`
                          : undefined
                      }
                      initialPatientList={patients}
                      placeholder={isLoadingData ? "Loading patients..." : "Select patient"}
                      aria-label="Select patient"
                      aria-required={true}
                    />
                  </div>
                  {mode === "add" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-10 shrink-0"
                      onClick={() => setIsAddPatientOpen(true)}
                      aria-label="Add new patient"
                      title="Add new patient"
                    >
                      <UserPlus className="size-4 text-primary" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Doctor Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Doctor <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.doctorMembershipId}
                  onValueChange={(val) => setField("doctorMembershipId", val ?? "")}
                  disabled={mode === "edit"}
                >
                  <SelectTrigger className="h-10 min-w-0 bg-background text-sm">
                    <User className="mr-2 size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-left">
                      {isLoadingData
                        ? "Loading doctors..."
                        : doctors.find(
                            (doc) => doc.membershipId === form.doctorMembershipId
                          )
                        ? (() => {
                            const doctor = doctors.find(
                              (doc) => doc.membershipId === form.doctorMembershipId
                            )!
                            return doctor.user?.fullName ?? doctor.invitedEmail
                          })()
                        : form.doctorMembershipId
                        ? "Selected doctor"
                        : "Select attending doctor"}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {doctors.map((doc) => (
                      <SelectItem key={doc.membershipId} value={doc.membershipId}>
                        {doc.user ? doc.user.fullName : doc.invitedEmail}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date & Time fields */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Consultation date <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          type="button"
                          className={cn(
                            "w-full justify-start text-left font-normal h-10 bg-background text-sm tabular-nums",
                            !form.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4 text-muted-foreground shrink-0" />
                          {form.date ? (
                            format(form.date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      }
                    />
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.date}
                        onSelect={(d) => setField("date", d ?? new Date())}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">
                      Start time <span className="text-destructive">*</span>
                    </Label>
                    <DashboardTimePicker
                      value={form.startTime}
                      onChange={(val) => setField("startTime", val)}
                      ariaLabel="Start time"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">
                      End time <span className="text-destructive">*</span>
                    </Label>
                    <DashboardTimePicker
                      value={form.endTime}
                      onChange={(val) => setField("endTime", val)}
                      ariaLabel="End time"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-medium text-foreground">
                  Reason for visit or clinical notes
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 size-4 text-muted-foreground pointer-events-none" />
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                    placeholder="Describe symptoms, reason for consultation, or instructions..."
                    className="pl-9 min-h-[90px] bg-background resize-none py-2 text-sm border-border/60"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-muted/30 p-4 border-t border-border/40 shrink-0 flex flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 px-4 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isLoadingData}
              className="h-10 px-5 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting
                ? "Saving..."
                : mode === "edit"
                ? "Save changes"
                : "Schedule appointment"}
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
            prev.type === "ready"
              ? { ...prev, patients: [...prev.patients, newPatient] }
              : prev
          )
          setField("patientId", newPatient.id)
        }}
      />
    </>
  )
}