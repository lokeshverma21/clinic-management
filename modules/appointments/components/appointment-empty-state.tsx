"use client"

import * as React from "react"
import { CalendarPlus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"

interface AppointmentEmptyStateProps {
  onBookAppointment: () => void
}

export function AppointmentEmptyState({ onBookAppointment }: AppointmentEmptyStateProps) {
  return (
    <DashboardEmptyState
      icon={CalendarPlus}
      title="No appointments scheduled"
      description="There are no appointments scheduled for this date. Create your first booking to get started."
      action={
        <Button 
          onClick={onBookAppointment}
          className="h-9 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
        >
          <Plus className="size-4" />
          <span>New appointment</span>
        </Button>
      }
      className="my-6"
    />
  )
}
