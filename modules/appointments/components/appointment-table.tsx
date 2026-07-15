"use client"

import * as React from "react"
import { 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  XCircle, 
  CheckCircle2 
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { AppointmentStatusBadge } from "./appointment-status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import type { AppointmentWithDetails } from "../appointment.types"

interface AppointmentTableProps {
  appointments: AppointmentWithDetails[];
  onViewDetails: (appointment: AppointmentWithDetails) => void;
  onEdit: (appointment: AppointmentWithDetails) => void;
  onRefresh: () => void;
}

export function AppointmentTable({ 
  appointments, 
  onViewDetails, 
  onEdit, 
  onRefresh 
}: AppointmentTableProps) {

  const handleUpdateStatus = async (id: string, status: "completed") => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        throw new Error("Failed to update status")
      }
      onRefresh()
    } catch (err) {
      console.error(err)
      alert("Error updating appointment status")
    }
  }

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

  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 p-8 text-center text-sm text-muted-foreground bg-card">
        No appointments found for the selected criteria.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border/60 overflow-hidden bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[100px] py-4">Time</TableHead>
            <TableHead className="py-4">Patient</TableHead>
            <TableHead className="py-4">Doctor</TableHead>
            <TableHead className="py-4">Status</TableHead>
            <TableHead className="py-4 hidden lg:table-cell">Notes</TableHead>
            <TableHead className="w-[80px] text-right py-4"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((apt) => {
            const timeFormatted = format(new Date(apt.startTime), "hh:mm a")
            const isCompletedOrCanceled = apt.status === "completed" || apt.status === "canceled"

            return (
              <TableRow key={apt.id} className="group hover:bg-muted/30 transition-colors border-border/50">
                <TableCell className="font-medium align-top py-4">{timeFormatted}</TableCell>
                <TableCell className="align-top py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-border/60">
                      <AvatarFallback className="text-[10px] bg-primary/5 text-primary">
                        {apt.patient.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span 
                        className="font-medium text-sm group-hover:text-primary transition-colors cursor-pointer"
                        onClick={() => onViewDetails(apt)}
                      >
                        {apt.patient.fullName}
                      </span>
                      <span className="text-xs text-muted-foreground">{apt.patient.phone}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="align-top py-4">
                  <span className="text-sm">{apt.doctor.fullName}</span>
                </TableCell>
                <TableCell className="align-top py-4">
                  <AppointmentStatusBadge status={apt.status} />
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground text-sm align-top py-4 hidden lg:table-cell">
                  {apt.notes || "-"}
                </TableCell>
                <TableCell className="text-right align-top py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <MoreHorizontal size={16} />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="gap-2" onClick={() => onViewDetails(apt)}>
                         <Eye size={16} className="text-muted-foreground" />
                         View Details
                      </DropdownMenuItem>
                      {!isCompletedOrCanceled && (
                        <>
                          <DropdownMenuItem className="gap-2" onClick={() => onEdit(apt)}>
                             <Pencil size={16} className="text-muted-foreground" />
                             Edit Appointment
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2" onClick={() => handleUpdateStatus(apt.id, "completed")}>
                             <CheckCircle2 size={16} className="text-green-600" />
                             Mark Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleCancelAppointment(apt.id)}>
                             <XCircle size={16} />
                             Cancel Appointment
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
