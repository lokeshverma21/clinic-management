"use client"

import * as React from "react"
import { 
  User, 
  Calendar, 
  FileText,
  Pencil,
  XCircle,
  CheckCircle2,
  Phone,
  Mail,
  AlertTriangle
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
import { StatusBadge } from "@/components/dashboard/dashboard-status-badge"
import { DashboardDetailRow } from "@/components/dashboard/dashboard-detail-row"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import type { AppointmentWithDetails } from "../appointment.types"

interface AppointmentDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: AppointmentWithDetails | null
  onEdit: () => void
  onSuccess?: () => void
}

export function AppointmentDetailsSheet({ 
  open, 
  onOpenChange, 
  appointment, 
  onEdit, 
  onSuccess 
}: AppointmentDetailsSheetProps) {
  const [loadingAction, setLoadingAction] = React.useState<"complete" | "cancel" | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setShowCancelConfirm(false)
      setError(null)
    }
    onOpenChange(isOpen)
  }

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
      setShowCancelConfirm(false)
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoadingAction(null)
    }
  }

  const startDate = new Date(appointment.startTime)
  const endDate = new Date(appointment.endTime)
  const readableSchedule = `${format(startDate, "EEE d MMM yyyy")}, ${format(startDate, "h:mm a")} to ${format(endDate, "h:mm a")}`

  const isPastOrClosed = appointment.status === "completed" || appointment.status === "canceled"

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-md border-l border-border/60 p-0 flex flex-col">
        <SheetHeader className="p-5 pb-4 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="text-xl font-semibold tracking-tight text-foreground">
              Appointment details
            </SheetTitle>
            <StatusBadge type="appointment" status={appointment.status} />
          </div>
          <SheetDescription className="text-xs text-muted-foreground tabular-nums">
            Reference #{appointment.id.substring(0, 8).toUpperCase()}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-5 space-y-5">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg font-medium leading-relaxed">
                {error}
              </div>
            )}

            {/* Cancel confirmation banner */}
            {showCancelConfirm && (
              <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-destructive">
                      Confirm cancellation
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Are you sure you want to cancel this appointment? The slot will be freed up for other bookings.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={loadingAction === "cancel"}
                  >
                    Keep appointment
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleCancelAppointment}
                    disabled={loadingAction === "cancel"}
                  >
                    {loadingAction === "cancel" ? "Cancelling..." : "Confirm cancel"}
                  </Button>
                </div>
              </div>
            )}

            {/* Schedule */}
            <div className="rounded-lg border border-border/60 p-4 bg-muted/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Calendar className="size-3.5 text-muted-foreground" />
                <span>Consultation schedule</span>
              </div>
              <p className="text-sm font-semibold text-foreground tabular-nums">
                {readableSchedule}
              </p>
            </div>

            {/* Patient Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <User className="size-3.5" />
                <span>Patient</span>
              </div>
              <div className="rounded-lg border border-border/60 p-3.5 bg-card flex items-center gap-3">
                <Avatar className="size-10 border border-border/60 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {appointment.patient.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 space-y-0.5">
                  <div className="text-sm font-semibold text-foreground truncate">
                    {appointment.patient.fullName}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 tabular-nums">
                      <Phone className="size-3" />
                      {appointment.patient.phone}
                    </span>
                    {appointment.patient.email && (
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="size-3" />
                        {appointment.patient.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <User className="size-3.5" />
                <span>Attending doctor</span>
              </div>
              <div className="rounded-lg border border-border/60 p-3.5 bg-card flex items-center gap-3">
                <Avatar className="size-10 border border-border/60 shrink-0">
                  <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
                    {appointment.doctor.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 space-y-0.5">
                  <span className="text-sm font-semibold text-foreground truncate">
                    Dr. {appointment.doctor.fullName}
                  </span>
                  <div className="text-xs text-muted-foreground truncate">
                    {appointment.doctor.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <FileText className="size-3.5" />
                <span>Reason for visit / notes</span>
              </div>
              <div className="rounded-lg border border-border/60 p-3.5 bg-card text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {appointment.notes || <span className="text-muted-foreground italic text-xs">No clinical notes recorded for this visit.</span>}
              </div>
            </div>

            {/* Details Metadata */}
            <div className="space-y-1 rounded-lg border border-border/60 p-3.5 bg-card">
              <DashboardDetailRow
                label="Created at"
                value={format(new Date(appointment.createdAt), "d MMM yyyy, h:mm a")}
                tabular
              />
              <DashboardDetailRow
                label="Last updated"
                value={format(new Date(appointment.updatedAt), "d MMM yyyy, h:mm a")}
                tabular
              />
            </div>
          </div>
        </ScrollArea>

        {!isPastOrClosed && (
          <SheetFooter className="p-4 border-t border-border/40 bg-muted/20 shrink-0 flex flex-col sm:flex-row gap-2">
            <Button 
              type="button"
              variant="outline" 
              className="w-full sm:w-auto flex-1 gap-2 text-xs h-9" 
              onClick={onEdit}
              disabled={loadingAction !== null}
            >
              <Pencil className="size-3.5" />
              <span>Edit</span>
            </Button>
            <Button 
              type="button"
              variant="destructive" 
              className="w-full sm:w-auto flex-1 gap-2 text-xs h-9"
              onClick={() => setShowCancelConfirm(true)}
              disabled={loadingAction !== null || showCancelConfirm}
            >
              <XCircle className="size-3.5" />
              <span>Cancel</span>
            </Button>
            <Button 
              type="button"
              className="w-full sm:w-auto flex-1 gap-2 text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => handleUpdateStatus("completed")}
              disabled={loadingAction !== null}
            >
              <CheckCircle2 className="size-3.5" />
              <span>{loadingAction === "complete" ? "Completing..." : "Complete"}</span>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
