"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  FileText, 
  Calendar, 
  Receipt, 
  Pencil, 
  Plus, 
  Clock,
  User,
  Phone,
  Mail,
  Scale,
  ShieldAlert,
  Archive,
  AlertTriangle
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card"
import { DashboardDetailRow } from "@/components/dashboard/dashboard-detail-row"
import { StatusBadge } from "@/components/dashboard/dashboard-status-badge"
import { PatientProfileHeader, calculateAge, formatGender } from "./patient-profile-header"
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
  const [showArchiveDialog, setShowArchiveDialog] = React.useState(false)

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

  // Archive Patient handler (Owner-only)
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
      setShowArchiveDialog(false)
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

  const age = calculateAge(patient.dateOfBirth)
  const formattedDob = patient.dateOfBirth
    ? `${format(new Date(patient.dateOfBirth), "d MMM yyyy")}${age !== null ? ` (${age} yrs)` : ""}`
    : "Not specified"

  return (
    <div className="space-y-6">
      {/* 1. Patient Profile Header with back link and key facts */}
      <PatientProfileHeader
        patient={patient}
        userRole={userRole}
        onEdit={() => setIsEditDialogOpen(true)}
        onBookAppointment={() => {
          setActiveAppointmentForEdit(null)
          setAppointmentDialogMode("add")
          setIsBookDialogOpen(true)
        }}
      />

      {/* 2. Compact Statistics Cards */}
      <PatientSummaryStats appointments={appointments} />

      {/* 3. SectionCards & Main Content Tabs */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList className="bg-muted/60 p-1 border border-border/40 h-9 rounded-lg">
          <TabsTrigger value="appointments" className="text-xs gap-1.5 px-3 py-1 font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <Calendar className="size-3.5" />
            <span>Appointments</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-0.5 tabular-nums">
              {appointments.length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger value="overview" className="text-xs gap-1.5 px-3 py-1 font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <User className="size-3.5" />
            <span>Overview</span>
          </TabsTrigger>

          <TabsTrigger value="notes" className="text-xs gap-1.5 px-3 py-1 font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <FileText className="size-3.5" />
            <span>Clinical notes</span>
            {patient.notes && (
              <span className="size-1.5 rounded-full bg-primary" />
            )}
          </TabsTrigger>

          <TabsTrigger value="billing" className="text-xs gap-1.5 px-3 py-1 font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs">
            <Receipt className="size-3.5" />
            <span>Billing & Invoices</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-0.5 tabular-nums">
              {invoices.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Appointments History */}
        <TabsContent value="appointments" className="focus-visible:outline-none space-y-4 mt-0">
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

        {/* Tab 2: Overview SectionCard (Contact, DOB/age, Gender) */}
        <TabsContent value="overview" className="focus-visible:outline-none space-y-4 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DashboardSectionCard
              title="Demographics & identity"
              description="Basic patient identification and personal details."
              icon={User}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="h-8 gap-1.5 text-xs font-medium"
                >
                  <Pencil className="size-3.5" />
                  <span>Edit</span>
                </Button>
              }
            >
              <div className="space-y-1">
                <DashboardDetailRow
                  label="Full name"
                  value={patient.fullName}
                  icon={User}
                />
                <DashboardDetailRow
                  label="Gender"
                  value={formatGender(patient.gender)}
                  icon={Scale}
                />
                <DashboardDetailRow
                  label="Date of birth & age"
                  value={formattedDob}
                  icon={Calendar}
                  tabular
                />
                <DashboardDetailRow
                  label="Patient identifier"
                  value={`#${patient.id.substring(0, 8).toUpperCase()}`}
                  tabular
                />
              </div>
            </DashboardSectionCard>

            <DashboardSectionCard
              title="Contact details & status"
              description="Primary communication and registration timestamps."
              icon={Phone}
            >
              <div className="space-y-1">
                <DashboardDetailRow
                  label="Phone number"
                  value={patient.phone}
                  icon={Phone}
                  tabular
                />
                <DashboardDetailRow
                  label="Email address"
                  value={patient.email}
                  icon={Mail}
                />
                <DashboardDetailRow
                  label="Account status"
                  value={<StatusBadge type="membershipStatus" status="active" />}
                />
                <DashboardDetailRow
                  label="Registered on"
                  value={format(new Date(patient.createdAt), "d MMM yyyy, h:mm a")}
                  tabular
                />
                <DashboardDetailRow
                  label="Last updated"
                  value={format(new Date(patient.updatedAt), "d MMM yyyy, h:mm a")}
                  tabular
                />
              </div>
            </DashboardSectionCard>
          </div>
        </TabsContent>

        {/* Tab 3: Clinical & Medical Notes SectionCards */}
        <TabsContent value="notes" className="focus-visible:outline-none space-y-4 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* General Patient Medical Notes */}
            <DashboardSectionCard
              title="General medical notes"
              description="Background, medical history, or chronic observations."
              icon={FileText}
              className="md:col-span-1 h-fit"
              action={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setNotesTarget({
                      type: "patient",
                      patientId: patient.id,
                      patientName: patient.fullName,
                      initialNotes: patient.notes,
                    })
                    setNotesModalOpen(true)
                  }}
                  aria-label="Edit patient notes"
                  title="Edit patient notes"
                >
                  <Pencil className="size-3.5" />
                </Button>
              }
            >
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
                    className="h-8 text-xs"
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
                    <span>Add medical notes</span>
                  </Button>
                </div>
              )}
              <div className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1 tabular-nums">
                <Clock className="size-3" />
                <span>Last updated: {format(new Date(patient.updatedAt), "d MMM yyyy")}</span>
              </div>
            </DashboardSectionCard>

            {/* Visit Clinical Notes Timeline */}
            <DashboardSectionCard
              title="Visit notes & summaries"
              description="Notes recorded by attending doctors for specific consultations."
              icon={Clock}
              className="md:col-span-2"
            >
              {appointments.filter((a) => a.notes).length === 0 ? (
                <div className="text-center py-10 px-4 border border-dashed border-border/60 rounded-lg space-y-2">
                  <p className="text-xs text-muted-foreground">
                    No visit notes recorded across past consultations.
                  </p>
                  <p className="text-[11px] text-muted-foreground/70">
                    Attending doctors and receptionists can record notes from the Appointments tab.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments
                    .filter((a) => a.notes)
                    .map((app) => (
                      <div
                        key={app.id}
                        className="bg-muted/20 border border-border/50 rounded-lg p-3 space-y-2 hover:border-border transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-2 text-xs">
                          <div className="font-medium text-foreground flex items-center gap-2 tabular-nums">
                            <span>{format(new Date(app.startTime), "d MMM yyyy, h:mm a")}</span>
                            <StatusBadge type="appointment" status={app.status} />
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
                            className="h-7 text-xs px-2 text-primary hover:text-primary"
                            onClick={() => {
                              setNotesTarget({ type: "appointment", appointment: app })
                              setNotesModalOpen(true)
                            }}
                          >
                            <Pencil className="size-3 mr-1" />
                            <span>Edit note</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2 text-muted-foreground"
                            onClick={() => {
                              setSelectedAppointment(app)
                              setIsAppointmentSheetOpen(true)
                            }}
                          >
                            <span>View appointment</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </DashboardSectionCard>
          </div>
        </TabsContent>

        {/* Tab 4: Invoices & Billing */}
        <TabsContent value="billing" className="focus-visible:outline-none space-y-4 mt-0">
          <PatientInvoicesList invoices={invoices} />
        </TabsContent>
      </Tabs>

      {/* 4. Danger Zone Card (Owner Only) */}
      {userRole === "owner" && (
        <Card className="border-destructive/30 bg-destructive/5 rounded-lg shadow-xs transition-colors">
          <CardHeader className="p-5 pb-3 border-b border-destructive/20 flex flex-row items-center justify-between gap-3 space-y-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="size-4" />
                <CardTitle className="text-base font-semibold">Danger zone</CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Archiving removes this patient from active directory lists while preserving compliance records.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 text-xs text-muted-foreground max-w-xl leading-relaxed">
              <p className="font-semibold text-foreground">Archive patient record</p>
              <p>
                Once archived, <strong>{patient.fullName}</strong> will no longer appear in the patient directory
                or in new booking dropdowns. All historical appointments, medical notes, invoices, and audit records
                remain intact for reporting and legal compliance.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowArchiveDialog(true)}
              disabled={isArchiving}
              className="shrink-0 gap-2 h-9 text-xs font-medium"
            >
              <Archive className="size-3.5" />
              <span>Archive patient</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog for Archiving Patient */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              <AlertDialogTitle>Archive patient record</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to archive <strong>{patient.fullName}</strong>?
              This is a soft delete. The patient will no longer appear in active directory lists or
              appointment scheduling, but their clinical notes, historical visits, and invoices will be safely preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isArchiving}
              onClick={(e) => {
                e.preventDefault()
                handleArchive()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isArchiving ? "Archiving..." : "Confirm archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
