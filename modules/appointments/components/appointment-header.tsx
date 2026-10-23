"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"

interface AppointmentHeaderProps {
  onBookAppointment: () => void
}

export function AppointmentHeader({ onBookAppointment }: AppointmentHeaderProps) {
  return (
    <DashboardPageHeader
      title="Appointments"
      description="Manage appointments and doctor schedules."
    >
      <Button
        onClick={onBookAppointment}
        className="h-9 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs text-sm font-medium"
      >
        <Plus className="size-4" />
        <span>New appointment</span>
      </Button>
    </DashboardPageHeader>
  )
}
