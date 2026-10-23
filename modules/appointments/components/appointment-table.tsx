"use client"

import * as React from "react"
import { 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  XCircle, 
  CheckCircle2, 
  Mail, 
  Loader2, 
  MessageCircle,
  Calendar
} from "lucide-react"
import { getWhatsAppUrl } from "@/modules/notifications/channels/whatsapp/whatsapp.service"
import type { WhatsAppMessageType } from "@/modules/notifications/channels/whatsapp/whatsapp.service"
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
import { StatusBadge } from "@/components/dashboard/dashboard-status-badge"
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import type { AppointmentWithDetails } from "../appointment.types"

interface AppointmentTableProps {
  appointments: AppointmentWithDetails[]
  onViewDetails: (appointment: AppointmentWithDetails) => void
  onEdit: (appointment: AppointmentWithDetails) => void
  onRefresh: () => void
}

export function AppointmentTable({ 
  appointments, 
  onViewDetails, 
  onEdit, 
  onRefresh 
}: AppointmentTableProps) {
  const [sendingEmailId, setSendingEmailId] = React.useState<string | null>(null)

  const handleOpenWhatsApp = (
    type: WhatsAppMessageType,
    appointment: AppointmentWithDetails,
  ) => {
    const phone = appointment.patient.phone
    if (!phone) {
      alert("This patient does not have a phone number on file.")
      return
    }

    const url = getWhatsAppUrl(type, {
      appointmentId: appointment.id,
      clinicId: appointment.clinicId,
      patientId: appointment.patientId,
      patientName: appointment.patient.fullName,
      patientPhone: phone,
      doctorName: appointment.doctor.fullName,
      startTime: new Date(appointment.startTime),
      endTime: new Date(appointment.endTime),
      status: appointment.status,
    })

    if (!url) {
      alert("Could not generate a WhatsApp link. Please check the patient's phone number.")
      return
    }

    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleSendConfirmationEmail = async (appointment: AppointmentWithDetails) => {
    if (!appointment.patient.email) {
      alert("This patient does not have an email address on file.")
      return
    }

    try {
      setSendingEmailId(appointment.id)
      const res = await fetch(`/api/appointments/${appointment.id}/send-confirmation-email`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error?.message ?? "Failed to send confirmation email")
      }
      alert("Confirmation email sent successfully.")
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : "Error sending confirmation email")
    } finally {
      setSendingEmailId(null)
    }
  }

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

  if (appointments.length === 0) {
    return (
      <DashboardEmptyState
        icon={Calendar}
        title="No appointments found"
        description="No appointments match the selected criteria and date."
        className="my-6"
      />
    )
  }

  return (
    <div className="rounded-lg border border-border/60 overflow-hidden bg-card shadow-xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent border-b border-border/60">
              <TableHead className="w-28 text-xs font-medium text-muted-foreground py-3 pl-4">Time</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground py-3">Patient</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground py-3">Doctor</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground py-3">Status</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground py-3 hidden lg:table-cell">Notes</TableHead>
              <TableHead className="w-16 text-right py-3 pr-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((apt) => {
              const timeFormatted = format(new Date(apt.startTime), "h:mm a")
              const isCompletedOrCanceled = apt.status === "completed" || apt.status === "canceled"

              return (
                <TableRow
                  key={apt.id}
                  className="group hover:bg-muted/50 transition-colors border-b border-border/40 h-12"
                >
                  <TableCell className="align-middle py-3 pl-4 font-medium text-sm text-foreground tabular-nums whitespace-nowrap">
                    {timeFormatted}
                  </TableCell>
                  <TableCell className="align-middle py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8 shrink-0 border border-border/60">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                          {apt.patient.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <button
                          type="button"
                          className="font-medium text-sm text-foreground group-hover:text-primary transition-colors text-left truncate cursor-pointer hover:underline"
                          onClick={() => onViewDetails(apt)}
                        >
                          {apt.patient.fullName}
                        </button>
                        <span className="text-xs text-muted-foreground tabular-nums">{apt.patient.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-middle py-3">
                    <span className="text-sm text-foreground truncate">{apt.doctor.fullName}</span>
                  </TableCell>
                  <TableCell className="align-middle py-3">
                    <StatusBadge type="appointment" status={apt.status} />
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground text-sm align-middle py-3 hidden lg:table-cell">
                    {apt.notes || "—"}
                  </TableCell>
                  <TableCell className="text-right align-middle py-3 pr-4">
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
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem className="gap-2 text-xs" onClick={() => onViewDetails(apt)}>
                          <Eye className="size-4 text-muted-foreground" />
                          <span>View details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-xs"
                          disabled={sendingEmailId === apt.id || !apt.patient.email}
                          onClick={() => handleSendConfirmationEmail(apt)}
                        >
                          {sendingEmailId === apt.id ? (
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Mail className="size-4 text-muted-foreground" />
                          )}
                          <span>Send email confirmation</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-xs"
                          disabled={!apt.patient.phone}
                          onClick={() => handleOpenWhatsApp("confirmation", apt)}
                        >
                          <MessageCircle className="size-4 text-success" />
                          <span>WhatsApp confirmation</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-xs"
                          disabled={!apt.patient.phone}
                          onClick={() => handleOpenWhatsApp("reminder", apt)}
                        >
                          <MessageCircle className="size-4 text-success" />
                          <span>WhatsApp reminder</span>
                        </DropdownMenuItem>
                        {!isCompletedOrCanceled && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-xs" onClick={() => onEdit(apt)}>
                              <Pencil className="size-4 text-muted-foreground" />
                              <span>Edit appointment</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-xs text-success" onClick={() => handleUpdateStatus(apt.id, "completed")}>
                              <CheckCircle2 className="size-4 text-success" />
                              <span>Mark completed</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-xs text-destructive focus:text-destructive" onClick={() => handleCancelAppointment(apt.id)}>
                              <XCircle className="size-4" />
                              <span>Cancel appointment</span>
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
    </div>
  )
}
