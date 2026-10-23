import * as React from "react"
import { StatusBadge, type AppointmentStatusValue } from "@/components/dashboard/dashboard-status-badge"

export type AppointmentStatus = AppointmentStatusValue

export interface AppointmentStatusBadgeProps {
  status: AppointmentStatus
  className?: string
}

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  return (
    <StatusBadge
      type="appointment"
      status={status}
      className={className}
    />
  )
}
