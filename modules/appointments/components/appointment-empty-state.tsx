"use client"

import * as React from "react"
import { CalendarPlus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AppointmentEmptyStateProps {
  onBookAppointment: () => void;
}

export function AppointmentEmptyState({ onBookAppointment }: AppointmentEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card rounded-xl border border-dashed border-border/80">
      <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
        <CalendarPlus size={32} />
      </div>
      <h3 className="text-xl font-semibold text-foreground">No appointments found</h3>
      <p className="text-muted-foreground mt-2 max-w-[280px] mx-auto text-sm leading-relaxed">
        There are no appointments scheduled for this date. Book your first appointment to get started.
      </p>
      <Button 
        onClick={onBookAppointment}
        className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm px-6"
      >
        <Plus className="mr-2 h-4 w-4" />
        Book Appointment
      </Button>
    </div>
  )
}
