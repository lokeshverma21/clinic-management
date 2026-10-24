// modules/staff/components/staff-details-view.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  Phone,
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  Pencil,
  Archive,
  CalendarDays,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StaffAvatar } from "./staff-avatar"
import { StatusBadge } from "@/components/dashboard/dashboard-status-badge"
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card"
import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card"
import { DashboardDetailRow } from "@/components/dashboard/dashboard-detail-row"
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import { StaffEditDialog } from "./staff-edit-dialog"
import { DeactivateStaffDialog } from "./staff-deactivate-dialog"
import { parse24To12 } from "@/components/dashboard/dashboard-time-picker"
import { formatIstDate, formatIstTime } from "@/lib/time"
import type { StaffListItem } from "../staff.types"
import type { AppointmentWithDetails } from "@/modules/appointments/appointment.types"

interface StaffDetailsViewProps {
  staff: StaffListItem
  currentMembershipId: string
  currentRole: string
  isLastActiveOwner: boolean
  canViewHistory: boolean
  historyNote?: string
  appointments: AppointmentWithDetails[]
}

const DAYS = [
  { key: "mon", label: "Mon", full: "Monday" },
  { key: "tue", label: "Tue", full: "Tuesday" },
  { key: "wed", label: "Wed", full: "Wednesday" },
  { key: "thu", label: "Thu", full: "Thursday" },
  { key: "fri", label: "Fri", full: "Friday" },
  { key: "sat", label: "Sat", full: "Saturday" },
  { key: "sun", label: "Sun", full: "Sunday" },
]

function formatTimeRange(range: string): string {
  const [start, end] = range.split("-")
  if (!start || !end) return range

  const pStart = parse24To12(start)
  const pEnd = parse24To12(end)
  const formatPart = (p: typeof pStart) => `${p.hour12}:${p.minute} ${p.period}`
  return `${formatPart(pStart)} to ${formatPart(pEnd)}`
}

export function StaffDetailsView({
  staff,
  currentMembershipId,
  currentRole,
  isLastActiveOwner,
  canViewHistory,
  historyNote,
  appointments,
}: StaffDetailsViewProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = React.useState(false)
  const [deactivateOpen, setDeactivateOpen] = React.useState(false)

  const isSelf = currentMembershipId === staff.membershipId
  const isDeactivated = staff.status === "deactivated"
  const isDoctor = staff.role === "doctor" || staff.role === "owner"
  const isInvited = staff.status === "invited" || !staff.user

  const name = staff.user?.fullName ?? "Pending Invite"
  const email = staff.user?.email ?? staff.invitedEmail ?? "—"
  const phone = staff.user?.phone ?? "—"
  const specialization = staff.staffProfile?.specialization || "None specified"
  const colorTag = staff.staffProfile?.colorTag
  const workingHours = staff.staffProfile?.workingHours

  const joinedText = staff.joinedAt
    ? formatIstDate(staff.joinedAt, "d MMM yyyy")
    : "Invitation pending"

  // Derive metrics for doctor appointment history
  const now = new Date()
  const totalAppointments = appointments.length
  const uniquePatients = new Set(appointments.map((a) => a.patient.id)).size
  const upcomingCount = appointments.filter(
    (a) => new Date(a.startTime) > now && (a.status === "booked" || a.status === "confirmed")
  ).length
  const completedCount = appointments.filter((a) => a.status === "completed").length
  const noShowCount = appointments.filter((a) => a.status === "no_show").length

  const pastAppointments = appointments
    .filter((a) => a.status === "completed" || new Date(a.endTime) <= now)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  const lastVisitDate = pastAppointments[0]
    ? formatIstDate(pastAppointments[0].startTime, "d MMM yyyy")
    : "None yet"

  // Recent appointments sorted desc
  const sortedAppointments = React.useMemo(() => {
    return [...appointments].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
  }, [appointments])

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/staff"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to staff directory</span>
        </Link>
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-5 rounded-lg border border-border/60 shadow-xs">
        <div className="flex items-center gap-3.5 min-w-0">
          <StaffAvatar name={name} className="size-14 text-base border-border/60 shrink-0" />
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground truncate">
                {name}
              </h1>
              <StatusBadge type="role" status={staff.role} />
              <StatusBadge type="membershipStatus" status={staff.status} />
              {isSelf && (
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 text-xs px-2 font-semibold"
                >
                  You
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {(!currentRole || currentRole === "owner") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="gap-1.5 h-9 text-xs"
            >
              <Pencil className="size-3.5" />
              <span>Edit staff</span>
            </Button>
          )}

          {(!currentRole || currentRole === "owner") && !isDeactivated && (
            <>
              {isSelf ? (
                <span className="text-[11px] text-muted-foreground italic">
                  Ask another owner to change your access
                </span>
              ) : isLastActiveOwner ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="gap-1.5 h-9 text-xs text-muted-foreground"
                  title="A clinic must always have at least one owner"
                >
                  <ShieldCheck className="size-3.5" />
                  <span>Last active owner</span>
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeactivateOpen(true)}
                  className="gap-1.5 h-9 text-xs"
                >
                  <Archive className="size-3.5" />
                  <span>Deactivate staff</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Grid: Profile Overview & Weekly Schedule */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Overview Card */}
        <DashboardSectionCard
          title="Staff Details"
          description="Contact information and professional profile."
        >
          <div className="space-y-2 text-xs">
            <DashboardDetailRow label="Full Name" value={name} />
            <DashboardDetailRow label="Email" value={email} icon={Mail} />
            <DashboardDetailRow label="Phone" value={phone} icon={Phone} />
            <DashboardDetailRow label="Specialization" value={specialization} icon={Briefcase} />
            <DashboardDetailRow label="Joined" value={joinedText} icon={Calendar} />
            {colorTag && (
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-muted-foreground font-medium">Color Badge</span>
                <div className="flex items-center gap-2">
                  <span
                    className="size-4 rounded-full border border-border/60 shrink-0"
                    style={{ backgroundColor: colorTag }}
                    aria-hidden="true"
                  />
                  <span className="text-foreground">{colorTag}</span>
                </div>
              </div>
            )}
          </div>
        </DashboardSectionCard>

        {/* Working Hours Card */}
        <DashboardSectionCard
          title="Working Hours"
          description="Configured weekly shift and availability schedule."
        >
          <div className="rounded-lg border border-border/60 bg-muted/20 overflow-hidden divide-y divide-border/40 text-xs">
            {DAYS.map((day) => {
              const ranges = workingHours?.[day.key as keyof typeof workingHours]
              const isOpen = Array.isArray(ranges) && ranges.length > 0

              return (
                <div
                  key={day.key}
                  className="p-2.5 px-3 flex items-center justify-between gap-2"
                >
                  <span className="font-medium text-foreground w-12">
                    {day.label}
                  </span>
                  <div className="text-right flex-1 truncate">
                    {isOpen ? (
                      <span className="text-foreground tabular-nums">
                        {ranges.map(formatTimeRange).join(", ")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">Closed</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </DashboardSectionCard>
      </div>

      {/* Doctor Patients & Appointment History Section */}
      {isDoctor && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">
              Clinical & Appointment Records
            </h2>
            <p className="text-xs text-muted-foreground">
              Recent patient appointments and schedule history for this doctor.
            </p>
          </div>

          {!canViewHistory ? (
            <div className="rounded-lg border border-border/60 bg-card p-6 text-center text-xs text-muted-foreground">
              <p>{historyNote || "Appointment history is restricted to clinic owners, receptionists, or the doctor themselves."}</p>
            </div>
          ) : isInvited ? (
            <div className="rounded-lg border border-border/60 bg-card p-6 text-center text-xs text-muted-foreground">
              <p>Staff member invitation is pending. Clinical records will appear once the member registers and takes appointments.</p>
            </div>
          ) : (
            <>
              {/* Summary KPIs */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <DashboardStatCard
                  title="Total Consults"
                  value={totalAppointments}
                  icon={CalendarDays}
                />
                <DashboardStatCard
                  title="Unique Patients"
                  value={uniquePatients}
                  icon={Users}
                />
                <DashboardStatCard
                  title="Upcoming"
                  value={upcomingCount}
                  icon={Clock}
                />
                <DashboardStatCard
                  title="Completed"
                  value={completedCount}
                  icon={CheckCircle2}
                />
                <DashboardStatCard
                  title="No-Shows"
                  value={noShowCount}
                  icon={XCircle}
                />
                <DashboardStatCard
                  title="Last Visit"
                  value={lastVisitDate}
                  icon={Calendar}
                />
              </div>

              {/* Table of Recent Appointments */}
              <div className="rounded-lg border border-border/60 overflow-hidden bg-card shadow-xs">
                {sortedAppointments.length === 0 ? (
                  <div className="p-8">
                    <DashboardEmptyState
                      icon={CalendarDays}
                      title="No appointments yet"
                      description="No clinical appointments recorded for this doctor."
                    />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/50 border-b border-border/60">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="h-10 text-xs font-medium text-muted-foreground pl-5">
                            Patient
                          </TableHead>
                          <TableHead className="h-10 text-xs font-medium text-muted-foreground">
                            Date
                          </TableHead>
                          <TableHead className="h-10 text-xs font-medium text-muted-foreground">
                            Time (12h)
                          </TableHead>
                          <TableHead className="h-10 text-xs font-medium text-muted-foreground">
                            Status
                          </TableHead>
                          <TableHead className="h-10 text-xs font-medium text-muted-foreground hidden md:table-cell">
                            Notes
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-border/40">
                        {sortedAppointments.slice(0, 15).map((apt) => {
                          const startDate = new Date(apt.startTime)
                          const endDate = new Date(apt.endTime)

                          return (
                            <TableRow key={apt.id} className="h-12 hover:bg-muted/30 transition-colors">
                              <TableCell className="pl-5 py-3">
                                <Link
                                  href={`/patients/${apt.patient.id}`}
                                  className="font-medium text-sm text-foreground hover:underline"
                                >
                                  {apt.patient.fullName}
                                </Link>
                                <div className="text-xs text-muted-foreground tabular-nums">
                                  {apt.patient.phone}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground tabular-nums py-3">
                                {formatIstDate(startDate, "EEE d MMM yyyy")}
                              </TableCell>
                              <TableCell className="text-xs text-foreground font-medium tabular-nums py-3">
                                {formatIstTime(startDate)} – {formatIstTime(endDate)}
                              </TableCell>
                              <TableCell className="py-3">
                                <StatusBadge type="appointment" status={apt.status} />
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-xs text-muted-foreground truncate max-w-[200px] py-3">
                                {apt.notes || "—"}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Non-doctor note */}
      {!isDoctor && (
        <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
          Appointment history and patient consultations are only applicable to doctor staff roles.
        </div>
      )}

      {/* Dialogs */}
      <StaffEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        staff={staff}
        currentMembershipId={currentMembershipId}
        onSuccess={() => router.refresh()}
      />

      <DeactivateStaffDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        membershipId={staff.membershipId}
        staffName={name}
        onSuccess={() => router.push("/staff")}
      />
    </div>
  )
}
