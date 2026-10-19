"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  FileText, 
  Calendar, 
  Receipt, 
  Pencil, 
  Plus, 
  Clock
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PatientProfileHeader } from "./patient-profile-header"
import { PatientSummaryStats } from "./patient-summary-stats"
import { PatientAppointmentHistory } from "./patient-appointment-history"
import { PatientInvoicesList } from "./patient-invoices-list"
import { PatientNotesModal } from "./patient-notes-modal"
import { PatientDialog } from "./patient-dialog"
import { AppointmentDialog } from "@/modules/appointments/components/appointment-dialog"
import { AppointmentDetailsSheet } from "@/modules/appointments/components/appointment-details-sheet"
import { format } from "date-fns"
import type { Patient } from "../patients.types"
import type { AppointmentWithDetails } from "@/modules/appointments/appointment.types"
import type { InvoiceWithDetails } from "@/modules/billing/billing.types"

interface PatientDetailsViewProps {
  initialPatient: Patient
  initialAppointments: AppointmentWithDetails[]
  initialInvoices: InvoiceWithDetails[]
  userRole: "owner" | "doctor" | "receptionist"
  currentMembershipId: string
}

export function PatientDetailsView({
  initialPatient,
  initialAppointments,
  initialInvoices,
  userRole,
  currentMembershipId,
}: PatientDetailsViewProps) {
  const router = useRouter()

  // State
  const [patient, setPatient] = React.useState<Patient>(initialPatient)
  const [appointments, setAppointments] = React.useState<AppointmentWithDetails[]>(initialAppointments)
  const [invoices, setInvoices] = React.useState<InvoiceWithDetails[]>(initialInvoices)
  const [isArchiving, setIsArchiving] = React.useState(false)

  // Dialog Controls
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isBookDialogOpen, setIsBookDialogOpen] = React.useState(false)
  const [appointmentDialogMode, setAppointmentDialogMode] = React.useState<"add" | "edit">("add")
  const [activeAppointmentForEdit, setActiveAppointmentForEdit] = React.useState<AppointmentWithDetails | null>(null)

  const [isAppointmentSheetOpen, setIsAppointmentSheetOpen] = React.useState(false)
  const [selectedAppointment, setSelectedAppointment] = React.useState<AppointmentWithDetails | null>(null)

  const [notesModalOpen, setNotesModalOpen] = React.useState(false)
  const [notesTarget, setNotesTarget] = React.useState<
    | { type: "appointment"; appointment: AppointmentWithDetails }
    | { type: "patient"; patientId: string; patientName: string; initialNotes: string | null }
    | null
  >(null)

  // Refresh data function
  const refreshData = React.useCallback(async () => {
    try {
      const [patientRes, appRes, invRes] = await Promise.all([
        fetch(`/api/patients/${patient.id}`),
        fetch(`/api/patients/${patient.id}/appointments`),
        fetch(`/api/billing?patientId=${patient.id}&page=1&pageSize=50`),
      ])

      if (patientRes.ok) {
        const pJson = await patientRes.json()
        if (pJson.data?.patient) setPatient(pJson.data.patient)
      }

      if (appRes.ok) {
        const aJson = await appRes.json()
        if (aJson.data?.appointments) setAppointments(aJson.data.appointments)
      }

      if (invRes.ok) {
        const iJson = await invRes.json()
        if (iJson.data?.invoices) setInvoices(iJson.data.invoices)
      }
    } catch (err) {
      console.error("Failed to refresh patient details", err)
    }
  }, [patient.id])

  // Archive Patient handler
  const handleArchive = async () => {
    try {
      setIsArchiving(true)
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Failed to archive patient")
      }
      router.push("/patients")
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to archive patient")
      setIsArchiving(false)
    }
  }

  // Appointment Status Change handler (Complete / Cancel)
  const handleAppointmentStatusChange = async (appointmentId: string, status: "completed" | "canceled") => {
    try {
      if (status === "completed") {
        const res = await fetch(`/api/appointments/${appointmentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" }),
        })
        if (!res.ok) {
          const json = await res.json()
          throw new Error(json.error?.message ?? "Failed to update appointment")
        }
      } else {
        const res = await fetch(`/api/appointments/${appointmentId}`, {
          method: "DELETE",
        })
        if (!res.ok) {
          const json = await res.json()
          throw new Error(json.error?.message ?? "Failed to cancel appointment")
        }
      }
      await refreshData()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed")
    }
  }

  // Edit specific appointment from sheet
  const handleEditAppointmentFromSheet = (app: AppointmentWithDetails) => {
    setIsAppointmentSheetOpen(false)
    setActiveAppointmentForEdit(app)
    setAppointmentDialogMode("edit")
    setIsBookDialogOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* 1. Patient Profile Header */}
      <PatientProfileHeader
        patient={patient}
        userRole={userRole}
        onEdit={() => setIsEditDialogOpen(true)}
        onBookAppointment={() => {
          setActiveAppointmentForEdit(null)
          setAppointmentDialogMode("add")
          setIsBookDialogOpen(true)
        }}
        onArchive={handleArchive}
        isArchiving={isArchiving}
      />

      {/* 2. Compact Statistics Cards */}
      <PatientSummaryStats appointments={appointments} />

      {/* 3. Main Content Tabs */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList className="bg-muted/60 p-1 border border-border/40 h-9">
          <TabsTrigger value="appointments" className="text-xs gap-1.5 px-3 py-1 font-medium">
            <Calendar className="size-3.5" />
            <span>Appointments</span>
            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 ml-0.5">
              {appointments.length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger value="notes" className="text-xs gap-1.5 px-3 py-1 font-medium">
            <FileText className="size-3.5" />
            <span>Clinical Notes</span>
            {patient.notes && (
              <span className="size-1.5 rounded-full bg-primary" />
            )}
          </TabsTrigger>

          <TabsTrigger value="billing" className="text-xs gap-1.5 px-3 py-1 font-medium">
            <Receipt className="size-3.5" />
            <span>Billing & Invoices</span>
            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 ml-0.5">
              {invoices.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Appointments History */}
        <TabsContent value="appointments" className="focus-visible:outline-none space-y-4">
          <PatientAppointmentHistory
            appointments={appointments}
            invoices={invoices}
            userRole={userRole}
            currentMembershipId={currentMembershipId}
            onViewAppointment={(app) => {
              setSelectedAppointment(app)
              setIsAppointmentSheetOpen(true)
            }}
            onEditNotes={(app) => {
              setNotesTarget({ type: "appointment", appointment: app })
              setNotesModalOpen(true)
            }}
            onBookAppointment={() => {
              setActiveAppointmentForEdit(null)
              setAppointmentDialogMode("add")
              setIsBookDialogOpen(true)
            }}
            onStatusChange={handleAppointmentStatusChange}
          />
        </TabsContent>

        {/* Tab 2: Clinical & Medical Notes */}
        <TabsContent value="notes" className="focus-visible:outline-none space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* General Patient Medical Notes */}
            <Card className="md:col-span-1 border-border/60 shadow-xs h-fit">
              <CardHeader className="p-4 pb-2 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <FileText className="size-3.5 text-primary" />
                    <span>General Medical Notes</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-7"
                    onClick={() => {
                      setNotesTarget({
                        type: "patient",
                        patientId: patient.id,
                        patientName: patient.fullName,
                        initialNotes: patient.notes,
                      })
                      setNotesModalOpen(true)
                    }}
                    title="Edit Patient Notes"
                  >
                    <Pencil className="size-3" />
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  Background, medical history, or chronic observations.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-3">
                {patient.notes ? (
                  <div className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded-lg border border-border/40">
                    {patient.notes}
                  </div>
                ) : (
                  <div className="text-center py-6 px-3 border border-dashed border-border/60 rounded-lg space-y-2">
                    <p className="text-xs text-muted-foreground italic">
                      No general medical notes recorded for this patient.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => {
                        setNotesTarget({
                          type: "patient",
                          patientId: patient.id,
                          patientName: patient.fullName,
                          initialNotes: patient.notes,
                        })
                        setNotesModalOpen(true)
                      }}
                    >
                      <Plus className="size-3 mr-1" />
                      Add Medical Notes
                    </Button>
                  </div>
                )}
                <div className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>Last updated: {format(new Date(patient.updatedAt), "MMM dd, yyyy")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Visit Clinical Notes Timeline */}
            <Card className="md:col-span-2 border-border/60 shadow-xs">
              <CardHeader className="p-4 pb-2 border-b border-border/40">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" />
                  <span>Visit Notes & Consultation Summaries</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Notes recorded by attending doctors for specific appointments.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-3 space-y-3">
                {appointments.filter((a) => a.notes).length === 0 ? (
                  <div className="text-center py-10 px-4 border border-dashed border-border/60 rounded-lg space-y-2">
                    <p className="text-xs text-muted-foreground">
                      No visit notes recorded across past consultations.
                    </p>
                    <p className="text-[11px] text-muted-foreground/70">
                      Attending doctors and staff can record visit notes from the Appointments tab.
                    </p>
                  </div>
                ) : (
                  appointments
                    .filter((a) => a.notes)
                    .map((app) => (
                      <div
                        key={app.id}
                        className="bg-muted/20 border border-border/50 rounded-lg p-3 space-y-2 hover:border-border transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-2 text-xs">
                          <div className="font-medium text-foreground flex items-center gap-2">
                            <span>{format(new Date(app.startTime), "MMMM dd, yyyy • hh:mm a")}</span>
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 font-normal">
                              {app.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground flex items-center gap-1">
                            <span>Attending: Dr. {app.doctor.fullName}</span>
                          </div>
                        </div>

                        <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                          {app.notes}
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[11px] px-2 text-primary hover:text-primary"
                            onClick={() => {
                              setNotesTarget({ type: "appointment", appointment: app })
                              setNotesModalOpen(true)
                            }}
                          >
                            <Pencil className="size-2.5 mr-1" />
                            Edit Note
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[11px] px-2 text-muted-foreground"
                            onClick={() => {
                              setSelectedAppointment(app)
                              setIsAppointmentSheetOpen(true)
                            }}
                          >
                            View Appointment
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Invoices & Billing */}
        <TabsContent value="billing" className="focus-visible:outline-none space-y-4">
          <PatientInvoicesList invoices={invoices} />
        </TabsContent>
      </Tabs>

      {/* Edit Patient Dialog */}
      <PatientDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mode="edit"
        patientId={patient.id}
        onSuccess={() => {
          refreshData()
        }}
      />

      {/* Book / Edit Appointment Dialog */}
      <AppointmentDialog
        open={isBookDialogOpen}
        onOpenChange={setIsBookDialogOpen}
        mode={appointmentDialogMode}
        appointment={activeAppointmentForEdit}
        initialPatientId={patient.id}
        onSuccess={() => {
          refreshData()
        }}
      />

      {/* Appointment Full Details Sheet */}
      <AppointmentDetailsSheet
        open={isAppointmentSheetOpen}
        onOpenChange={setIsAppointmentSheetOpen}
        appointment={selectedAppointment}
        onEdit={() => {
          if (selectedAppointment) {
            handleEditAppointmentFromSheet(selectedAppointment)
          }
        }}
        onSuccess={() => {
          refreshData()
        }}
      />

      {/* Notes Editor Modal */}
      <PatientNotesModal
        open={notesModalOpen}
        onOpenChange={setNotesModalOpen}
        target={notesTarget}
        onSuccess={() => {
          refreshData()
        }}
      />
    </div>
  )
}
