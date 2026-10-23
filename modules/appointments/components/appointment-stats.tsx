"use client"

import * as React from "react"
import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react"
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card"
import type { AppointmentWithDetails } from "../appointment.types"

interface AppointmentStatsProps {
  appointments: AppointmentWithDetails[]
}

export function AppointmentStats({ appointments }: AppointmentStatsProps) {
  const total = appointments.length
  const confirmed = appointments.filter((a) => a.status === "confirmed").length
  const completed = appointments.filter((a) => a.status === "completed").length
  const canceled = appointments.filter(
    (a) => a.status === "canceled" || a.status === "no_show"
  ).length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardStatCard
        title="Scheduled"
        value={total}
        icon={Calendar}
      />
      <DashboardStatCard
        title="Confirmed"
        value={confirmed}
        icon={CheckCircle2}
      />
      <DashboardStatCard
        title="Completed"
        value={completed}
        icon={Clock}
      />
      <DashboardStatCard
        title="Canceled / No show"
        value={canceled}
        icon={XCircle}
      />
    </div>
  )
}
