"use client"

import * as React from "react"
import { 
  User, 
  Calendar, 
  Clock, 
  FileText,
  Pencil,
  XCircle,
  CheckCircle2,
  Activity 
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AppointmentStatusBadge } from "./appointment-status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import type { AppointmentWithDetails } from "../appointment.types"

interface AppointmentDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentWithDetails | null;
  onEdit: () => void;
  onSuccess?: () => void;
}

export function AppointmentDetailsSheet({ 
  open, 
  onOpenChange, 
  appointment, 
  onEdit, 
  onSuccess 
}: AppointmentDetailsSheetProps) {
  const [loadingAction, setLoadingAction] = React.useState<"complete" | "cancel" | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  if (!appointment) return null

  const handleUpdateStatus = async (status: "completed") => {
    try {
      setLoadingAction("complete")
      setError(null)
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error?.message ?? "Failed to update appointment status")
      }
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoadingAction(null)
    }
  }

  const handleCancelAppointment = async () => {
    try {
      setLoadingAction("cancel")
      setError(null)
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error?.message ?? "Failed to cancel appointment")
      }
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoadingAction(null)
    }
  }

  const formattedDate = format(new Date(appointment.startTime), "MMMM dd, yyyy")
  const formattedTime = `${format(new Date(appointment.startTime), "hh:mm a")} - ${format(new Date(appointment.endTime), "hh:mm a")}`

  const isPastOrClosed = appointment.status === "completed" || appointment.status === "canceled"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md border-l border-border/60 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Appointment Details</SheetTitle>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
          <SheetDescription>
            Reference ID: {appointment.id.substring(0, 8).toUpperCase()}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-6">
            {error && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg font-medium">
                {error}
              </div>
            )}

            {/* Patient Info */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <User size={14} />
                Patient Information
              </h3>
              <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-lg border border-border/50">
                <Avatar className="h-12 w-12 border border-background">
                  <AvatarFallback className="bg-primary/5 text-primary text-sm font-semibold">
                    {appointment.patient.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-foreground">{appointment.patient.fullName}</div>
                  <div className="text-sm text-muted-foreground">{appointment.patient.phone}</div>
                  {appointment.patient.email && (
                    <div className="text-[11px] text-muted-foreground mt-0.5">{appointment.patient.email}</div>
                  )}
                </div>
              </div>
            </section>

            {/* Doctor Info */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <User size={14} />
                Assigned Doctor
              </h3>
              <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-lg border border-border/50">
                <Avatar className="h-12 w-12 border border-background">
                  <AvatarFallback className="bg-blue-50 text-blue-600 text-sm font-semibold">
                    {appointment.doctor.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-foreground">{appointment.doctor.fullName}</div>
                  <div className="text-sm text-muted-foreground">{appointment.doctor.email}</div>
                </div>
              </div>
            </section>

            {/* Date & Time */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Calendar size={14} />
                Schedule
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Date</span>
                  <span className="text-sm font-medium">{formattedDate}</span>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Time</span>
                  <span className="text-sm font-medium">{formattedTime}</span>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileText size={14} />
                Special Notes
              </h3>
              <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {appointment.notes || "No special notes provided."}
                </p>
              </div>
            </section>

            {/* Activity Timeline */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity size={14} />
                Activity History
              </h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-[11px] before:w-px before:bg-border/50 ml-1">
                <div className="relative pl-7">
                  <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-border border-2 border-background" />
                  <div className="text-sm font-medium">Record Created</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {format(new Date(appointment.createdAt), "PPP 'at' p")}
                  </div>
                </div>
                {appointment.status !== "booked" && (
                  <div className="relative pl-7">
                    <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                    <div className="text-sm font-medium">Status Updated to {appointment.status}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {format(new Date(appointment.updatedAt), "PPP 'at' p")}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </ScrollArea>

        {!isPastOrClosed && (
          <SheetFooter className="p-6 border-t border-border/50 grid grid-cols-2 gap-2 bg-muted/10">
            <Button 
              variant="outline" 
              className="w-full gap-2 text-xs" 
              onClick={onEdit}
              disabled={loadingAction !== null}
            >
              <Pencil size={14} />
              Edit
            </Button>
            <Button 
              variant="outline" 
              className="w-full gap-2 text-xs text-destructive hover:text-destructive"
              onClick={handleCancelAppointment}
              disabled={loadingAction !== null}
            >
              <XCircle size={14} />
              {loadingAction === "cancel" ? "Cancelling..." : "Cancel"}
            </Button>
            <Button 
              className="w-full gap-2 text-xs col-span-2 mt-2 bg-primary"
              onClick={() => handleUpdateStatus("completed")}
              disabled={loadingAction !== null}
            >
              <CheckCircle2 size={14} />
              {loadingAction === "complete" ? "Completing..." : "Mark as Completed"}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
