"use client"

import * as React from "react"
import { 
  User, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  Pencil,
  Archive,
  Scale
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/dashboard/dashboard-status-badge"
import { DashboardDetailRow } from "@/components/dashboard/dashboard-detail-row"
import { PatientAvatar } from "./patient-avatar"
import { format } from "date-fns"
import type { Patient } from "../patients.types"

interface PatientDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string | null
  onEdit: () => void
  onSuccess?: () => void
}

function calculateAge(dobStr?: string | null): number | null {
  if (!dobStr) return null
  const dob = new Date(dobStr)
  if (isNaN(dob.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age >= 0 ? age : null
}

function formatGender(gender?: string | null): string {
  if (!gender || gender === "undisclosed") return "Undisclosed"
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()
}

export function PatientDetailsSheet({ 
  open, 
  onOpenChange, 
  patientId,
  onEdit,
  onSuccess
}: PatientDetailsSheetProps) {
  const [patient, setPatient] = React.useState<Patient | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [archiving, setArchiving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open || !patientId) return
    
    async function loadPatient() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/patients/${patientId}`)
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error?.message ?? "Failed to fetch patient details")
        }
        setPatient(json.data.patient)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    loadPatient()
  }, [open, patientId])

  const handleArchive = async () => {
    if (!patientId) return
    const confirmed = window.confirm("Are you sure you want to archive this patient? This will hide the record from active lists while preserving historical data.")
    if (!confirmed) return

    try {
      setArchiving(true)
      setError(null)
      const res = await fetch(`/api/patients/${patientId}`, {
        method: "DELETE"
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Failed to archive patient")
      }
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setArchiving(false)
    }
  }

  if (open && loading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md border-l border-border/60 p-6 flex flex-col justify-center items-center">
          <div className="text-muted-foreground text-sm font-medium animate-pulse">Loading profile...</div>
        </SheetContent>
      </Sheet>
    )
  }

  if (open && (error || !patient)) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md border-l border-border/60 p-6 flex flex-col justify-center items-center">
          <div className="text-destructive text-sm font-medium">{error ?? "Patient profile not found"}</div>
        </SheetContent>
      </Sheet>
    )
  }

  const creationDate = patient ? format(new Date(patient.createdAt), "d MMM yyyy") : ""
  const age = calculateAge(patient?.dateOfBirth)
  const birthday = patient?.dateOfBirth 
    ? `${format(new Date(patient.dateOfBirth), "d MMM yyyy")}${age !== null ? ` (${age} yrs)` : ""}` 
    : "Not specified"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md border-l border-border/60 p-0 flex flex-col">
        <SheetHeader className="p-5 pb-4 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="text-xl font-semibold tracking-tight text-foreground">
              Patient profile
            </SheetTitle>
            <StatusBadge type="membershipStatus" status="active" />
          </div>
          <SheetDescription className="text-xs text-muted-foreground tabular-nums">
            Record registered on {creationDate}
          </SheetDescription>
        </SheetHeader>

        {patient && (
          <>
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-5 space-y-5">
                {/* Header / Basic Info */}
                <div className="flex flex-col items-center text-center space-y-2 py-2">
                  <PatientAvatar name={patient.fullName} className="size-16 text-lg border border-border/60" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">{patient.fullName}</h3>
                    <p className="text-xs text-muted-foreground tabular-nums">ID: #{patient.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>

                <Separator className="bg-border/40" />

                {/* Personal Info */}
                <div className="space-y-1 rounded-lg border border-border/60 p-3.5 bg-card">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="size-3.5" />
                    <span>Personal information</span>
                  </div>
                  <DashboardDetailRow
                    label="Phone"
                    value={patient.phone}
                    icon={Phone}
                    tabular
                  />
                  <DashboardDetailRow
                    label="Email"
                    value={patient.email}
                    icon={Mail}
                  />
                  <DashboardDetailRow
                    label="Gender"
                    value={formatGender(patient.gender)}
                    icon={Scale}
                  />
                  <DashboardDetailRow
                    label="Date of birth"
                    value={birthday}
                    icon={Calendar}
                    tabular
                  />
                </div>

                {/* Medical Notes */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="size-3.5" />
                    <span>Medical history / notes</span>
                  </div>
                  <div className="rounded-lg border border-border/60 p-3.5 bg-card text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {patient.notes || <span className="text-muted-foreground italic text-xs">No medical notes recorded.</span>}
                  </div>
                </div>

                {/* System Activity */}
                <div className="space-y-1 rounded-lg border border-border/60 p-3.5 bg-card">
                  <DashboardDetailRow
                    label="Registered"
                    value={format(new Date(patient.createdAt), "d MMM yyyy, h:mm a")}
                    tabular
                  />
                  <DashboardDetailRow
                    label="Last updated"
                    value={format(new Date(patient.updatedAt), "d MMM yyyy, h:mm a")}
                    tabular
                  />
                </div>
              </div>
            </ScrollArea>

            <SheetFooter className="p-4 border-t border-border/40 bg-muted/20 shrink-0 grid grid-cols-2 gap-2">
              <Button 
                type="button"
                variant="outline" 
                className="w-full gap-2 text-xs h-9" 
                onClick={onEdit}
                disabled={archiving}
              >
                <Pencil className="size-3.5" />
                <span>Edit profile</span>
              </Button>
              <Button 
                type="button"
                variant="outline" 
                className="w-full gap-2 text-xs h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleArchive}
                disabled={archiving}
              >
                <Archive className="size-3.5" />
                <span>{archiving ? "Archiving..." : "Archive"}</span>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
