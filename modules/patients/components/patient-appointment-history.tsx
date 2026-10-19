"use client"

import * as React from "react"
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  CalendarPlus, 
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppointmentStatusBadge } from "@/modules/appointments/components/appointment-status-badge"
import { format, isAfter, isToday, isTomorrow, isYesterday } from "date-fns"
import type { AppointmentWithDetails } from "@/modules/appointments/appointment.types"
import type { InvoiceWithDetails } from "@/modules/billing/billing.types"

interface PatientAppointmentHistoryProps {
  appointments: AppointmentWithDetails[]
  invoices?: InvoiceWithDetails[]
  userRole: "owner" | "doctor" | "receptionist"
  currentMembershipId?: string
  onViewAppointment: (appointment: AppointmentWithDetails) => void
  onEditNotes: (appointment: AppointmentWithDetails) => void
  onBookAppointment: () => void
  onStatusChange?: (appointmentId: string, status: "completed" | "canceled") => Promise<void>
}

type TabFilter = "all" | "upcoming" | "completed" | "canceled"

export function PatientAppointmentHistory({
  appointments,
  invoices = [],
  userRole,
  currentMembershipId,
  onViewAppointment,
  onEditNotes,
  onBookAppointment,
  onStatusChange,
}: PatientAppointmentHistoryProps) {
  const [activeTab, setActiveTab] = React.useState<TabFilter>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 8

  // Create lookup map of appointmentId -> Invoice
  const invoiceByAppointmentId = React.useMemo(() => {
    const map = new Map<string, InvoiceWithDetails>()
    for (const inv of invoices) {
      if (inv.appointmentId) {
        map.set(inv.appointmentId, inv)
      }
    }
    return map
  }, [invoices])

  // Filter appointments
  const filteredAppointments = React.useMemo(() => {
    const now = new Date()
    return appointments.filter((app) => {
      const appStart = new Date(app.startTime)

      // Tab filter
      if (activeTab === "upcoming") {
        if (app.status === "canceled" || !isAfter(appStart, now)) return false
      } else if (activeTab === "completed") {
        if (app.status !== "completed") return false
      } else if (activeTab === "canceled") {
        if (app.status !== "canceled" && app.status !== "no_show") return false
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const doctorMatch = app.doctor.fullName.toLowerCase().includes(query)
        const notesMatch = app.notes?.toLowerCase().includes(query) ?? false
        const idMatch = app.id.toLowerCase().includes(query)
        if (!doctorMatch && !notesMatch && !idMatch) return false
      }

      return true
    })
  }, [appointments, activeTab, searchQuery])

  // Pagination
  const totalItems = filteredAppointments.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const paginatedAppointments = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAppointments.slice(start, start + pageSize)
  }, [filteredAppointments, currentPage, pageSize])

  const canModify = (app: AppointmentWithDetails) => {
    if (userRole === "owner" || userRole === "receptionist") return true
    if (userRole === "doctor" && app.doctorMembershipId === currentMembershipId) return true
    return false
  }

  const formatRelativeDay = (date: Date) => {
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    if (isYesterday(date)) return "Yesterday"
    return null
  }

  return (
    <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-xs space-y-4 p-4 sm:p-5">
      {/* Header with Title and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            <span>Appointment History</span>
            <Badge variant="secondary" className="text-xs px-2 py-0 h-5 font-medium ml-1">
              {appointments.length}
            </Badge>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chronological log of visits, doctor consultations, and visit clinical notes.
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg self-start sm:self-auto border border-border/40">
          {(
            [
              { id: "all", label: "All" },
              { id: "upcoming", label: "Upcoming" },
              { id: "completed", label: "Completed" },
              { id: "canceled", label: "Canceled" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setCurrentPage(1)
              }}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar: Search and summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search doctor, notes, or reference..."
            className="h-8 pl-8 text-xs bg-background/50 border-border/60 focus:bg-background"
          />
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={onBookAppointment}
          className="h-8 gap-1.5 text-xs font-medium self-end sm:self-auto"
        >
          <CalendarPlus className="size-3.5 text-primary" />
          <span>New Appointment</span>
        </Button>
      </div>

      {/* Appointment Table */}
      {paginatedAppointments.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-border/70 rounded-lg space-y-3">
          <div className="size-10 rounded-full bg-muted/80 flex items-center justify-center mx-auto text-muted-foreground">
            <Calendar className="size-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              {searchQuery ? "No matching appointments found" : "No appointments in this view"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? `No appointment matched "${searchQuery}". Try clearing search keywords.`
                : activeTab === "all"
                ? "This patient has no appointment records yet. Book their first consultation."
                : `No ${activeTab} appointments found for this patient.`}
            </p>
          </div>
          {searchQuery ? (
            <Button size="sm" variant="outline" onClick={() => setSearchQuery("")} className="h-8 text-xs">
              Clear Search
            </Button>
          ) : (
            <Button size="sm" onClick={onBookAppointment} className="h-8 text-xs gap-1.5">
              <CalendarPlus className="size-3.5" />
              <span>Book Appointment</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="border border-border/60 rounded-lg overflow-hidden bg-background">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px] text-xs font-semibold">Date & Time</TableHead>
                <TableHead className="text-xs font-semibold">Doctor</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Clinical Notes</TableHead>
                <TableHead className="text-xs font-semibold">Billing</TableHead>
                <TableHead className="w-[80px] text-right text-xs font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAppointments.map((app) => {
                const startDate = new Date(app.startTime)
                const endDate = new Date(app.endTime)
                const relativeDay = formatRelativeDay(startDate)
                const invoice = invoiceByAppointmentId.get(app.id)

                return (
                  <TableRow key={app.id} className="hover:bg-muted/30 transition-colors">
                    {/* Date & Time */}
                    <TableCell className="align-top py-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
                          <span>{format(startDate, "MMM dd, yyyy")}</span>
                          {relativeDay && (
                            <Badge 
                              variant={relativeDay === "Today" ? "default" : "secondary"} 
                              className="text-[10px] px-1.5 py-0 h-4 font-normal"
                            >
                              {relativeDay}
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3" />
                          <span>
                            {format(startDate, "hh:mm a")} - {format(endDate, "hh:mm a")}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Doctor */}
                    <TableCell className="align-top py-3">
                      <div className="space-y-0.5">
                        <div className="font-medium text-xs text-foreground flex items-center gap-1">
                          <User className="size-3 text-muted-foreground" />
                          <span>Dr. {app.doctor.fullName}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                          {app.doctor.email}
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="align-top py-3">
                      <AppointmentStatusBadge status={app.status} className="text-[10px]" />
                    </TableCell>

                    {/* Notes */}
                    <TableCell className="align-top py-3 max-w-[220px]">
                      {app.notes ? (
                        <div className="space-y-1">
                          <p className="text-xs text-foreground/90 line-clamp-2 leading-relaxed bg-muted/30 p-1.5 rounded border border-border/40">
                            {app.notes}
                          </p>
                          <button
                            onClick={() => onEditNotes(app)}
                            className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="size-3" />
                            <span>View / Edit Note</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onEditNotes(app)}
                          className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 p-1 rounded hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <FileText className="size-3 opacity-60" />
                          <span className="italic">+ Add visit note</span>
                        </button>
                      )}
                    </TableCell>

                    {/* Billing */}
                    <TableCell className="align-top py-3">
                      {invoice ? (
                        <div className="space-y-0.5">
                          <Badge
                            variant={
                              invoice.status === "paid"
                                ? "default"
                                : invoice.status === "partially_paid"
                                ? "secondary"
                                : "outline"
                            }
                            className={`text-[10px] px-1.5 py-0 h-4 font-normal ${
                              invoice.status === "paid"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                                : invoice.status === "unpaid"
                                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                                : ""
                            }`}
                          >
                            {invoice.status.toUpperCase()}
                          </Badge>
                          <div className="text-[11px] font-mono text-muted-foreground">
                            ${Number(invoice.totalAmount).toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/70 italic">None</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="align-top py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" className="size-7">
                              <MoreVertical className="size-3.5" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => onViewAppointment(app)}
                            className="cursor-pointer gap-2 text-xs"
                          >
                            <Eye className="size-3.5 text-muted-foreground" />
                            <span>View Full Details</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => onEditNotes(app)}
                            className="cursor-pointer gap-2 text-xs"
                          >
                            <FileText className="size-3.5 text-muted-foreground" />
                            <span>{app.notes ? "Edit Visit Note" : "Add Visit Note"}</span>
                          </DropdownMenuItem>

                          {canModify(app) && app.status !== "completed" && app.status !== "canceled" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onStatusChange?.(app.id, "completed")}
                                className="cursor-pointer gap-2 text-xs text-emerald-600 dark:text-emerald-400"
                              >
                                <CheckCircle2 className="size-3.5" />
                                <span>Mark Completed</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => onStatusChange?.(app.id, "canceled")}
                                className="cursor-pointer gap-2 text-xs text-destructive"
                              >
                                <XCircle className="size-3.5" />
                                <span>Cancel Appointment</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} -{" "}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} appointments
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="size-7"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="text-xs px-2 font-medium text-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="size-7"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
