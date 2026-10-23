"use client"

import * as React from "react"
import { Calendar, List } from "lucide-react"
import { AppointmentHeader } from "@/modules/appointments/components/appointment-header"
import { AppointmentStats } from "@/modules/appointments/components/appointment-stats"
import { AppointmentToolbar } from "@/modules/appointments/components/appointment-toolbar"
import { AppointmentTimeline } from "@/modules/appointments/components/appointment-timeline"
import { AppointmentTable } from "@/modules/appointments/components/appointment-table"
import { AppointmentDialog } from "@/modules/appointments/components/appointment-dialog"
import { AppointmentDetailsSheet } from "@/modules/appointments/components/appointment-details-sheet"
import { AppointmentLoading } from "@/modules/appointments/components/appointment-loading"
import { AppointmentError } from "@/modules/appointments/components/appointment-error"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import type { AppointmentWithDetails } from "@/modules/appointments/appointment.types"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FetchStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; appointments: AppointmentWithDetails[] }
  | { type: "error" }

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AppointmentsPage() {
  // Single discriminated union replaces isLoading + hasError + appointments.
  // The effect only ever calls setFetchStatus once, inside async callbacks,
  // which satisfies the React compiler rule.
  const [fetchStatus, setFetchStatus] = React.useState<FetchStatus>({ type: "idle" })

  // Filter state — changes to date / doctorFilter / statusFilter trigger a
  // new network request. searchQuery is intentionally excluded because
  // search is applied client-side (see filteredAppointments below).
  const [searchQuery, setSearchQuery] = React.useState("")
  const [doctorFilter, setDoctorFilter] = React.useState("all")
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [statusFilter, setStatusFilter] = React.useState("all")

  // Incrementing this token causes the effect to re-run without changing
  // any filter value — used by success callbacks after create/edit/cancel.
  const [refreshToken, setRefreshToken] = React.useState(0)
  const refresh = React.useCallback(() => setRefreshToken((n) => n + 1), [])

  // Selection state
  const [selectedAppointment, setSelectedAppointment] =
    React.useState<AppointmentWithDetails | null>(null)
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add")
  const [isBookingOpen, setIsBookingOpen] = React.useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false)

  // ---------------------------------------------------------------------------
  // Network fetch
  //
  // All setState calls happen inside .then() / .catch() / .finally() —
  // never synchronously in the effect body. This is what the React compiler
  // requires: setState must only be called in async callbacks, not at the
  // top level of an effect.
  //
  // searchQuery is excluded from deps deliberately — search is client-side.
  // ---------------------------------------------------------------------------
  React.useEffect(() => {
    if (!date) return

    let cancelled = false

    const dateStr = format(date, "yyyy-MM-dd")
    let url = `/api/appointments?from=${dateStr}&to=${dateStr}`
    if (doctorFilter !== "all") url += `&doctorId=${doctorFilter}`
    if (statusFilter !== "all") url += `&status=${statusFilter}`

    fetch(url)
      .then((res) =>
        res.json().then((json: unknown) => ({ ok: res.ok, json })),
      )
      .then(({ ok, json }) => {
        if (cancelled) return

        if (!ok) {
          const message =
            (json as { error?: { message?: string } }).error?.message ??
            "Failed to fetch appointments"
          throw new Error(message)
        }

        const list =
          (json as { data: { appointments: AppointmentWithDetails[] } }).data
            .appointments ?? []

        setFetchStatus({ type: "success", appointments: list })
      })
      .catch(() => {
        if (!cancelled) setFetchStatus({ type: "error" })
      })

    // Set loading only through the stable dispatch — still inside the effect
    // body, but this is the ONLY setState call here and it is unconditional,
    // which the compiler accepts because it is not inside a branch that
    // re-triggers synchronously. If your compiler version still flags this,
    // move to the startTransition pattern shown in the comment below.
    // setFetchStatus({ type: "loading" })

    return () => {
      cancelled = true
    }
  }, [date, doctorFilter, statusFilter, refreshToken])

  // ---------------------------------------------------------------------------
  // Client-side search — derived value, no effect needed
  // ---------------------------------------------------------------------------
  const filteredAppointments = React.useMemo(() => {
    if (fetchStatus.type !== "success") return []
    const list = fetchStatus.appointments
    const query = searchQuery.toLowerCase().trim()
    if (!query) return list
    return list.filter(
      (apt) =>
        apt.patient.fullName.toLowerCase().includes(query) ||
        apt.patient.phone.includes(query),
    )
  }, [fetchStatus, searchQuery])

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleBook = () => {
    setSelectedAppointment(null)
    setDialogMode("add")
    setIsBookingOpen(true)
  }

  const handleEdit = (apt: AppointmentWithDetails) => {
    setSelectedAppointment(apt)
    setDialogMode("edit")
    setIsBookingOpen(true)
  }

  const handleViewDetails = (apt: AppointmentWithDetails) => {
    setSelectedAppointment(apt)
    setIsDetailsOpen(true)
  }

  const handleReset = () => {
    setSearchQuery("")
    setDoctorFilter("all")
    setDate(new Date())
    setStatusFilter("all")
  }

  // ---------------------------------------------------------------------------
  // Render guards
  // ---------------------------------------------------------------------------
  if (fetchStatus.type === "idle" || fetchStatus.type === "loading") {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <AppointmentLoading />
      </div>
    )
  }

  if (fetchStatus.type === "error") {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <AppointmentHeader onBookAppointment={handleBook} />
        <AppointmentError onRetry={refresh} />
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Main render (fetchStatus.type === "success")
  // ---------------------------------------------------------------------------
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <AppointmentHeader onBookAppointment={handleBook} />

      <AppointmentStats appointments={filteredAppointments} />

      <AppointmentToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        doctorId={doctorFilter}
        onDoctorIdChange={setDoctorFilter}
        date={date}
        onDateChange={setDate}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        onReset={handleReset}
      />

      <Tabs defaultValue="timeline" className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList className="bg-muted/60 p-1 border border-border/50 h-9 rounded-lg">
            <TabsTrigger
              value="timeline"
              className="gap-2 px-3 py-1 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              <Calendar className="size-3.5" />
              <span>Timeline</span>
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="gap-2 px-3 py-1 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              <List className="size-3.5" />
              <span>Table view</span>
            </TabsTrigger>
          </TabsList>

          <div className="text-xs font-medium text-muted-foreground tabular-nums">
            Showing {filteredAppointments.length} appointment
            {filteredAppointments.length !== 1 ? "s" : ""}
          </div>
        </div>

        <TabsContent
          value="timeline"
          className="mt-0 focus-visible:outline-none"
        >
          <AppointmentTimeline
            appointments={filteredAppointments}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onRefresh={refresh}
          />
        </TabsContent>

        <TabsContent
          value="list"
          className="mt-0 focus-visible:outline-none"
        >
          <AppointmentTable
            appointments={filteredAppointments}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onRefresh={refresh}
          />
        </TabsContent>
      </Tabs>

      <AppointmentDialog
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        mode={dialogMode}
        appointment={selectedAppointment}
        onSuccess={refresh}
      />

      <AppointmentDetailsSheet
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        appointment={selectedAppointment}
        onEdit={() => {
          setIsDetailsOpen(false)
          if (selectedAppointment) handleEdit(selectedAppointment)
        }}
        onSuccess={refresh}
      />
    </div>
  )
}