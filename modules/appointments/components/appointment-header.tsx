"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AppointmentHeaderProps {
  onBookAppointment: () => void;
}

export function AppointmentHeader({ onBookAppointment }: AppointmentHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Appointments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage appointments and doctor schedules.
        </p>
      </div>
      <Button 
        onClick={onBookAppointment}
        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
      >
        <Plus className="mr-2 h-4 w-4" />
        Book Appointment
      </Button>
    </div>
  )
}
