"use client"

import * as React from "react"
import { MoreHorizontal, Clock, Eye, Pencil, XCircle, Calendar } from "lucide-react"
import { StatusBadge } from "@/components/dashboard/dashboard-status-badge"
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatIstTime } from "@/lib/time/ist"
import type { AppointmentWithDetails } from "../appointment.types"

interface AppointmentTimelineProps {
  appointments: AppointmentWithDetails[]
  onViewDetails: (appointment: AppointmentWithDetails) => void
  onEdit: (appointment: AppointmentWithDetails) => void
  onRefresh: () => void
}

export function AppointmentTimeline({ 
  appointments, 
  onViewDetails, 
  onEdit, 
  onRefresh 
}: AppointmentTimelineProps) {
  
  const handleCancelAppointment = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to cancel this appointment?")
    if (!confirmed) return

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

  // Group by time-slot format using 12-hour h:mm a
  const groups: { timeSlot: string; appointments: AppointmentWithDetails[] }[] = []

  sorted.forEach((apt) => {
    const timeSlot = formatIstTime(apt.startTime)
    const existing = groups.find((g) => g.timeSlot === timeSlot)
    if (existing) {
      existing.appointments.push(apt)
    } else {
      groups.push({ timeSlot, appointments: [apt] })
    }
  })

  if (appointments.length === 0) {
    return (
      <DashboardEmptyState
        icon={Calendar}
        title="No appointments scheduled"
        description="There are no appointments scheduled for this date and criteria."
        className="my-6"
      />
    )
  }

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:left-[47px] before:w-px before:bg-border/60">
      {groups.map((slot, index) => (
        <div key={index} className="relative flex gap-5">
          <div className="w-[94px] pt-2 flex flex-col items-end shrink-0">
            <span className="text-xs font-medium text-muted-foreground tabular-nums whitespace-nowrap bg-background px-1.5 py-0.5 rounded border border-border/40 z-10">
              {slot.timeSlot}
            </span>
          </div>
          
          <div className="flex-1 space-y-2.5 min-w-0">
            {slot.appointments.map((apt) => {
              const diffMs = new Date(apt.endTime).getTime() - new Date(apt.startTime).getTime()
              const duration = `${Math.round(diffMs / 60000)} min`
              const isPastOrClosed = apt.status === "completed" || apt.status === "canceled"

              return (
                <Card
                  key={apt.id}
                  className="p-3.5 shadow-xs border-border/60 bg-card hover:border-border transition-colors group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="hidden sm:flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
                        <Clock className="size-4" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <button
                          type="button"
                          className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors text-left truncate cursor-pointer hover:underline block"
                          onClick={() => onViewDetails(apt)}
                        >
                          {apt.patient.fullName}
                        </button>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="truncate">Dr. {apt.doctor.fullName}</span>
                          {apt.patient.phone && (
                            <>
                              <span>•</span>
                              <span className="tabular-nums">{apt.patient.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge type="appointment" status={apt.status} />
                        <span className="text-[10px] text-muted-foreground tabular-nums">{duration}</span>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-foreground"
                              aria-label="Appointment actions"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem className="gap-2 text-xs" onClick={() => onViewDetails(apt)}>
                            <Eye className="size-4 text-muted-foreground" />
                            <span>View details</span>
                          </DropdownMenuItem>
                          {!isPastOrClosed && (
                            <>
                              <DropdownMenuItem className="gap-2 text-xs" onClick={() => onEdit(apt)}>
                                <Pencil className="size-4 text-muted-foreground" />
                                <span>Edit appointment</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive gap-2 text-xs"
                                onClick={() => handleCancelAppointment(apt.id)}
                              >
                                <XCircle className="size-4" />
                                <span>Cancel appointment</span>
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
