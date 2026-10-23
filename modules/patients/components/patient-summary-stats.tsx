"use client"

import * as React from "react"
import { 
  Calendar, 
  CalendarCheck2, 
  CalendarClock, 
  CalendarX2, 
  Clock, 
  History,
  UserCheck
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { format, isAfter, isBefore } from "date-fns"
import type { AppointmentWithDetails } from "@/modules/appointments/appointment.types"

interface PatientSummaryStatsProps {
  appointments: AppointmentWithDetails[]
}

export function PatientSummaryStats({ appointments }: PatientSummaryStatsProps) {
  const now = new Date()

  const total = appointments.length

  const upcomingAppointments = appointments
    .filter((a) => a.status !== "canceled" && isAfter(new Date(a.startTime), now))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  const completed = appointments.filter((a) => a.status === "completed").length

  const canceledOrMissed = appointments.filter(
    (a) => a.status === "canceled" || a.status === "no_show"
  ).length

  const pastAppointments = appointments
    .filter((a) => isBefore(new Date(a.startTime), now) && a.status !== "canceled")
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

  const nextAppointment = upcomingAppointments[0]
  const lastAppointment = pastAppointments[0]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
      {/* 4 Numerical Metrics */}
      <Card className="lg:col-span-6 border-border/60 shadow-xs bg-card">
        <CardContent className="p-3.5 h-full flex flex-col justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Total */}
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Total</span>
                <Calendar className="size-3.5 text-muted-foreground" />
              </div>
              <div className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">{total}</div>
              <p className="text-xs text-muted-foreground truncate">All bookings</p>
            </div>

            {/* Upcoming Count */}
            <div className="p-2.5 rounded-lg bg-info/10 border border-info/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-info">
                  Upcoming
                </span>
                <CalendarClock className="size-3.5 text-info" />
              </div>
              <div className="text-2xl font-semibold tracking-tight text-info tabular-nums">
                {upcomingAppointments.length}
              </div>
              <p className="text-xs text-muted-foreground truncate">Scheduled</p>
            </div>

            {/* Completed */}
            <div className="p-2.5 rounded-lg bg-success/10 border border-success/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-success">
                  Completed
                </span>
                <CalendarCheck2 className="size-3.5 text-success" />
              </div>
              <div className="text-2xl font-semibold tracking-tight text-success tabular-nums">
                {completed}
              </div>
              <p className="text-xs text-muted-foreground truncate">Finished</p>
            </div>

            {/* Canceled / Missed */}
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-destructive truncate">
                  Canceled
                </span>
                <CalendarX2 className="size-3.5 text-destructive" />
              </div>
              <div className="text-2xl font-semibold tracking-tight text-destructive tabular-nums">
                {canceledOrMissed}
              </div>
              <p className="text-xs text-muted-foreground truncate">Canceled/no show</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Upcoming Visit */}
      <Card className="lg:col-span-3 border-border/60 shadow-xs bg-card flex flex-col justify-between">
        <CardContent className="p-3.5 space-y-2 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-info flex items-center gap-1.5">
              <Clock className="size-3.5" />
              Next visit
            </span>
            {nextAppointment && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-info/10 text-info border border-info/20">
                Scheduled
              </span>
            )}
          </div>

          {nextAppointment ? (
            <div className="space-y-1">
              <div className="text-sm font-semibold text-foreground tracking-tight tabular-nums">
                {format(new Date(nextAppointment.startTime), "EEE, d MMM yyyy")}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                <Clock className="size-3 text-muted-foreground shrink-0" />
                <span>{format(new Date(nextAppointment.startTime), "h:mm a")}</span>
                <span>•</span>
                <span className="truncate">Dr. {nextAppointment.doctor.fullName}</span>
              </div>
            </div>
          ) : (
            <div className="py-1 space-y-0.5">
              <p className="text-xs font-medium text-foreground">No upcoming visits</p>
              <p className="text-xs text-muted-foreground">No bookings scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Visit Details */}
      <Card className="lg:col-span-3 border-border/60 shadow-xs bg-card flex flex-col justify-between">
        <CardContent className="p-3.5 space-y-2 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <History className="size-3.5" />
              Last visit
            </span>
          </div>

          {lastAppointment ? (
            <div className="space-y-1">
              <div className="text-sm font-semibold text-foreground tracking-tight tabular-nums">
                {format(new Date(lastAppointment.startTime), "EEE, d MMM yyyy")}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <UserCheck className="size-3 text-muted-foreground shrink-0" />
                <span className="truncate">Dr. {lastAppointment.doctor.fullName}</span>
              </div>
            </div>
          ) : (
            <div className="py-1 space-y-0.5">
              <p className="text-xs font-medium text-foreground">No past visits</p>
              <p className="text-xs text-muted-foreground">No consultation history</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}