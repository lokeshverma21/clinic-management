"use client"

import * as React from "react"
import { 
  User, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  Activity,
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
import { PatientAvatar } from "./patient-avatar"
import { format } from "date-fns"
import type { Patient } from "../patients.types"

interface PatientDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string | null;
  onEdit: () => void;
  onSuccess?: () => void;
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
    const confirmed = window.confirm("Are you sure you want to archive this patient? This is a soft delete.")
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

  const creationDate = patient ? format(new Date(patient.createdAt), "MMM dd, yyyy") : ""
  const birthday = patient?.dateOfBirth ? format(new Date(patient.dateOfBirth), "MMMM dd, yyyy") : "Not specified"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md border-l border-border/60 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Patient Profile</SheetTitle>
            <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active
            </div>
          </div>
          <SheetDescription>
            Record created on {creationDate}
          </SheetDescription>
        </SheetHeader>

        {patient && (
          <>
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6 space-y-8">
                {/* Header / Basic Info */}
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                  <PatientAvatar name={patient.fullName} className="h-20 w-20 text-xl" />
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{patient.fullName}</h3>
                    <p className="text-xs text-muted-foreground">ID: #{patient.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>

                <Separator className="bg-border/40" />

                {/* Contact & Personal */}
                <div className="grid gap-6">
                  <section className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <User size={14} />
                      Personal Information
                    </h4>
                    <div className="grid gap-3">
                      <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase">Phone</span>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Phone size={14} className="text-muted-foreground" />
                          {patient.phone}
                        </div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase">Email</span>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Mail size={14} className="text-muted-foreground" />
                          {patient.email || "Not specified"}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col gap-1">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase">Gender</span>
                          <div className="flex items-center gap-2 text-sm font-medium capitalize">
                            <Scale size={14} className="text-muted-foreground" />
                            {patient.gender || "undisclosed"}
                          </div>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col gap-1">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase">Birthday</span>
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Calendar size={14} className="text-muted-foreground" />
                            {birthday}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Medical Notes */}
                  <section className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <FileText size={14} />
                      Medical Notes
                    </h4>
                    <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {patient.notes || "No custom medical notes logged."}
                      </p>
                    </div>
                  </section>

                  {/* Recent Activity */}
                  <section className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Activity size={14} />
                      System Activity
                    </h4>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:left-[11px] before:w-px before:bg-border/50 ml-1">
                      <div className="relative pl-7">
                        <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-border border-2 border-background" />
                        <div className="text-sm font-medium">Record Last Modified</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>{format(new Date(patient.updatedAt), "PPP 'at' p")}</span>
                        </div>
                      </div>
                      <div className="relative pl-7">
                        <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-border border-2 border-background" />
                        <div className="text-sm font-medium">Patient Registered</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>{format(new Date(patient.createdAt), "PPP 'at' p")}</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </ScrollArea>

            <SheetFooter className="p-6 border-t border-border/50 grid grid-cols-2 gap-2 bg-muted/10">
              <Button 
                variant="outline" 
                className="w-full gap-2 text-xs" 
                onClick={onEdit}
                disabled={archiving}
              >
                <Pencil size={14} />
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2 text-xs text-destructive hover:text-destructive"
                onClick={handleArchive}
                disabled={archiving}
              >
                <Archive size={14} />
                {archiving ? "Archiving..." : "Archive"}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
