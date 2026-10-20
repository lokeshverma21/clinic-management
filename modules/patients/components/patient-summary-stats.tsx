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
      {/* ------------------------------------------------------------- */}
      {/* PART 1: Combined Box for the 4 Numerical Metrics (Span 6)      */}
      {/* ------------------------------------------------------------- */}
      <Card className="lg:col-span-6 border-border/60 shadow-none bg-card hover:border-border transition-colors">
        <CardContent className="p-3.5 h-full flex flex-col justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            
            {/* Total */}
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total</span>
                <Calendar className="size-3.5 text-primary" />
              </div>
              <div className="text-xl font-bold tracking-tight text-foreground">{total}</div>
              <p className="text-[10px] text-muted-foreground truncate">All bookings</p>
            </div>

            {/* Upcoming Count */}
            <div className="p-2.5 rounded-lg bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/15 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Upcoming
                </span>
                <CalendarClock className="size-3.5 text-blue-500" />
              </div>
              <div className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {upcomingAppointments.length}
              </div>
              <p className="text-[10px] text-muted-foreground truncate">Scheduled</p>
            </div>

            {/* Completed */}
            <div className="p-2.5 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Done
                </span>
                <CalendarCheck2 className="size-3.5 text-emerald-500" />
              </div>
              <div className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {completed}
              </div>
              <p className="text-[10px] text-muted-foreground truncate">Successful</p>
            </div>

            {/* Canceled / Missed */}
            <div className="p-2.5 rounded-lg bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/15 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 truncate">
                  Canceled
                </span>
                <CalendarX2 className="size-3.5 text-rose-500" />
              </div>
              <div className="text-xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                {canceledOrMissed}
              </div>
              <p className="text-[10px] text-muted-foreground truncate">Missed/No-show</p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* PART 2A: Next Upcoming Visit (Separate Box - Span 3)          */}
      {/* ------------------------------------------------------------- */}
      <Card className="lg:col-span-3 border-border/60 shadow-none bg-card hover:border-border transition-colors flex flex-col justify-between">
        <CardContent className="p-3.5 space-y-2 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Clock className="size-3.5" />
              Next Visit
            </span>
            {nextAppointment && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Confirmed
              </span>
            )}
          </div>

          {nextAppointment ? (
            <div className="space-y-1">
              <div className="text-sm font-bold text-foreground tracking-tight">
                {format(new Date(nextAppointment.startTime), "EEE, MMM dd, yyyy")}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Clock className="size-3 text-muted-foreground/70 shrink-0" />
                <span>{format(new Date(nextAppointment.startTime), "hh:mm a")}</span>
                <span>•</span>
                <span className="truncate">Dr. {nextAppointment.doctor.fullName}</span>
              </div>
            </div>
          ) : (
            <div className="py-1 space-y-0.5">
              <p className="text-xs font-medium text-foreground">No upcoming visits</p>
              <p className="text-[11px] text-muted-foreground">No bookings scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* PART 2B: Last Visit Details (Separate Box - Span 3)            */}
      {/* ------------------------------------------------------------- */}
      <Card className="lg:col-span-3 border-border/60 shadow-none bg-card hover:border-border transition-colors flex flex-col justify-between">
        <CardContent className="p-3.5 space-y-2 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <History className="size-3.5" />
              Last Visit
            </span>
          </div>

          {lastAppointment ? (
            <div className="space-y-1">
              <div className="text-sm font-bold text-foreground tracking-tight">
                {format(new Date(lastAppointment.startTime), "EEE, MMM dd, yyyy")}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <UserCheck className="size-3 text-muted-foreground/70 shrink-0" />
                <span className="truncate">Dr. {lastAppointment.doctor.fullName}</span>
              </div>
            </div>
          ) : (
            <div className="py-1 space-y-0.5">
              <p className="text-xs font-medium text-foreground">No past visits</p>
              <p className="text-[11px] text-muted-foreground">No history recorded</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}