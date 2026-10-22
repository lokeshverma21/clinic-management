"use client"

import * as React from "react"
import { Users, UserCheck, CalendarCheck, Activity } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { AdminClinicStaffCounts, AdminClinicAppointmentCounts } from "../clinics.types"

interface ClinicUsageCardsProps {
  staffCounts: AdminClinicStaffCounts;
  patientCount: number;
  appointmentCount: AdminClinicAppointmentCounts;
}

export function ClinicUsageCards({
  staffCounts,
  patientCount,
  appointmentCount,
}: ClinicUsageCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Staff Count Card */}
      <Card className="shadow-none border-border/60">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Active Staff Seats</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {staffCounts.total}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>{staffCounts.doctor} Dr</span>
            <span>·</span>
            <span>{staffCounts.receptionist} Rec</span>
            <span>·</span>
            <span>{staffCounts.owner} Owner</span>
          </div>
        </CardContent>
      </Card>

      {/* Patients Count Card */}
      <Card className="shadow-none border-border/60">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Registered Patients</span>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {patientCount.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            Excludes soft-deleted patient charts
          </div>
        </CardContent>
      </Card>

      {/* Appointments Count Card */}
      <Card className="shadow-none border-border/60">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Appointments Booked</span>
            <CalendarCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {appointmentCount.total.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Activity className="h-3 w-3 text-blue-500" />
            <span>{appointmentCount.last30Days.toLocaleString()} in last 30 days</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
