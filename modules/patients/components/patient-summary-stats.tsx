"use client"

import * as React from "react"
import { 
  Calendar, 
  CalendarCheck2, 
  CalendarClock, 
  CalendarX2, 
  Clock, 
  History 
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Total Appointments */}
      <Card className="border-border/60 shadow-none bg-card hover:border-border transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total</span>
            <Calendar className="size-3.5 text-primary" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">{total}</div>
          <p className="text-[11px] text-muted-foreground truncate">All-time bookings</p>
        </CardContent>
      </Card>

      {/* Upcoming */}
      <Card className="border-border/60 shadow-none bg-card hover:border-border transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Upcoming</span>
            <CalendarClock className="size-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
            {upcomingAppointments.length}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">Scheduled visits</p>
        </CardContent>
      </Card>

      {/* Completed */}
      <Card className="border-border/60 shadow-none bg-card hover:border-border transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Completed</span>
            <CalendarCheck2 className="size-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {completed}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">Successful visits</p>
        </CardContent>
      </Card>

      {/* Canceled or Missed */}
      <Card className="border-border/60 shadow-none bg-card hover:border-border transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Canceled / Missed</span>
            <CalendarX2 className="size-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            {canceledOrMissed}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">Canceled or no-show</p>
        </CardContent>
      </Card>

      {/* Last Visit */}
      <Card className="border-border/60 shadow-none bg-card hover:border-border transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Last Visit</span>
            <History className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-sm font-semibold tracking-tight text-foreground truncate">
            {lastAppointment ? format(new Date(lastAppointment.startTime), "MMM dd, yyyy") : "None"}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {lastAppointment ? `Dr. ${lastAppointment.doctor.fullName.split(" ")[0]}` : "No past visits"}
          </p>
        </CardContent>
      </Card>

      {/* Next Upcoming */}
      <Card className="border-border/60 shadow-none bg-card hover:border-border transition-colors">
        <CardContent className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Next Visit</span>
            <Clock className="size-3.5 text-primary" />
          </div>
          <div className="text-sm font-semibold tracking-tight text-foreground truncate">
            {nextAppointment ? format(new Date(nextAppointment.startTime), "MMM dd, yyyy") : "None"}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {nextAppointment ? format(new Date(nextAppointment.startTime), "hh:mm a") : "No bookings"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
