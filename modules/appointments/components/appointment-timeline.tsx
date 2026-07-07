"use client"

import * as React from "react"
import { MoreHorizontal, Clock } from "lucide-react"
import { AppointmentStatusBadge, type AppointmentStatus } from "./appointment-status-badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppointmentItem {
  id: string;
  time: string;
  patientName: string;
  doctorName: string;
  status: AppointmentStatus;
  duration: string;
}

const mockTimelineData: { timeSlot: string; appointments: AppointmentItem[] }[] = [
  {
    timeSlot: "09:00 AM",
    appointments: [
      { id: "1", time: "09:00 AM", patientName: "Sarah Connor", doctorName: "Dr. Smith", status: "completed", duration: "30 min" },
    ],
  },
  {
    timeSlot: "09:30 AM",
    appointments: [
      { id: "2", time: "09:30 AM", patientName: "John Doe", doctorName: "Dr. Smith", status: "confirmed", duration: "45 min" },
      { id: "3", time: "09:30 AM", patientName: "Jane Miller", doctorName: "Dr. Johnson", status: "booked", duration: "15 min" },
    ],
  },
  {
    timeSlot: "10:00 AM",
    appointments: [
      { id: "4", time: "10:00 AM", patientName: "Michael Scott", doctorName: "Dr. Johnson", status: "no_show", duration: "20 min" },
    ],
  },
  {
    timeSlot: "11:00 AM",
    appointments: [
      { id: "5", time: "11:00 AM", patientName: "Pam Beesly", doctorName: "Dr. Smith", status: "booked", duration: "60 min" },
    ],
  },
];

export function AppointmentTimeline() {
  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:left-[41px] before:w-px before:bg-border/60">
      {mockTimelineData.map((slot, index) => (
        <div key={index} className="relative flex gap-6">
          <div className="w-[82px] pt-1.5 flex flex-col items-end">
             <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap bg-background px-1 z-10">
               {slot.timeSlot}
             </span>
          </div>
          
          <div className="flex-1 space-y-3">
            {slot.appointments.map((apt) => (
              <Card key={apt.id} className="p-3 shadow-none border-border/60 bg-card/40 hover:bg-card/80 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-md bg-primary/5 text-primary">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {apt.patientName}
                      </h4>
                      <p className="text-xs text-muted-foreground">with {apt.doctorName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-1">
                      <AppointmentStatusBadge status={apt.status} />
                      <span className="text-[10px] text-muted-foreground">{apt.duration}</span>
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Appointment</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
