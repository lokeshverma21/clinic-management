"use client"

import * as React from "react"
import { MoreHorizontal, Clock, Eye, Pencil, XCircle } from "lucide-react"
import { AppointmentStatusBadge } from "./appointment-status-badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import type { AppointmentWithDetails } from "../appointment.types"

interface AppointmentTimelineProps {
  appointments: AppointmentWithDetails[];
  onViewDetails: (appointment: AppointmentWithDetails) => void;
  onEdit: (appointment: AppointmentWithDetails) => void;
  onRefresh: () => void;
}

export function AppointmentTimeline({ 
  appointments, 
  onViewDetails, 
  onEdit, 
  onRefresh 
}: AppointmentTimelineProps) {
  
  const handleCancelAppointment = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error("Failed to cancel appointment")
      }
      onRefresh()
    } catch (err) {
      console.error(err)
      alert("Error cancelling appointment")
    }
  }

  // Chronologically sort
  const sorted = [...appointments].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )

  // Group by time-slot format
  const groups: { timeSlot: string; appointments: AppointmentWithDetails[] }[] = []

  sorted.forEach((apt) => {
    const timeSlot = format(new Date(apt.startTime), "hh:mm a")
    const existing = groups.find((g) => g.timeSlot === timeSlot)
    if (existing) {
      existing.appointments.push(apt)
    } else {
      groups.push({ timeSlot, appointments: [apt] })
    }
  })

  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 p-8 text-center text-sm text-muted-foreground bg-card">
        No appointments scheduled for the selected criteria.
      </div>
    )
  }

  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:left-[41px] before:w-px before:bg-border/60">
      {groups.map((slot, index) => (
        <div key={index} className="relative flex gap-6 animate-in fade-in slide-in-from-bottom-1 duration-300">
          <div className="w-[82px] pt-1.5 flex flex-col items-end">
             <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap bg-background px-1 z-10">
               {slot.timeSlot}
             </span>
          </div>
          
          <div className="flex-1 space-y-3">
            {slot.appointments.map((apt) => {
              const diffMs = new Date(apt.endTime).getTime() - new Date(apt.startTime).getTime()
              const duration = `${Math.round(diffMs / 60000)} min`
              const isPastOrClosed = apt.status === "completed" || apt.status === "canceled"

              return (
                <Card key={apt.id} className="p-3 shadow-none border-border/60 bg-card/40 hover:bg-card/85 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-md bg-primary/5 text-primary">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h4 
                          className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer"
                          onClick={() => onViewDetails(apt)}
                        >
                          {apt.patient.fullName}
                        </h4>
                        <p className="text-xs text-muted-foreground">with {apt.doctor.fullName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-1">
                        <AppointmentStatusBadge status={apt.status} />
                        <span className="text-[10px] text-muted-foreground">{duration}</span>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal size={16} />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => onViewDetails(apt)}>
                            <Eye size={14} className="text-muted-foreground" />
                            View Details
                          </DropdownMenuItem>
                          {!isPastOrClosed && (
                            <>
                              <DropdownMenuItem className="gap-2" onClick={() => onEdit(apt)}>
                                <Pencil size={14} className="text-muted-foreground" />
                                Edit Appointment
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive gap-2" onClick={() => handleCancelAppointment(apt.id)}>
                                <XCircle size={14} />
                                Cancel
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
