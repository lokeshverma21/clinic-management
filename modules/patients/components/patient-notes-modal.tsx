"use client"

import * as React from "react"
import { FileText, Calendar, User, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import type { AppointmentWithDetails } from "@/modules/appointments/appointment.types"

type TargetNote =
  | { type: "appointment"; appointment: AppointmentWithDetails }
  | { type: "patient"; patientId: string; patientName: string; initialNotes: string | null }

interface PatientNotesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: TargetNote | null
  onSuccess: () => void
}

export function PatientNotesModal({
  open,
  onOpenChange,
  target,
  onSuccess,
}: PatientNotesModalProps) {
  const [notes, setNotes] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [syncKey, setSyncKey] = React.useState("")
  const currentKey = open && target ? `${target.type}-${target.type === "appointment" ? target.appointment.id : target.patientId}` : "closed"

  if (currentKey !== syncKey) {
    setSyncKey(currentKey)
    if (open && target) {
      setNotes(target.type === "appointment" ? (target.appointment.notes ?? "") : (target.initialNotes ?? ""))
      setError(null)
    }
  }

  if (!target) return null

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      if (target.type === "appointment") {
        const res = await fetch(`/api/appointments/${target.appointment.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: notes.trim() || null }),
        })
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error?.message ?? "Failed to save appointment notes")
        }
      } else {
        const res = await fetch(`/api/patients/${target.patientId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: notes.trim() || null }),
        })
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error?.message ?? "Failed to save patient notes")
        }
      }

      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update notes")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isAppointment = target.type === "appointment"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <DialogTitle className="text-base sm:text-lg">
              {isAppointment ? "Appointment Clinical Notes" : "Patient Medical Notes"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            {isAppointment
              ? "Clinical observations, diagnosis, or visit summary associated with this consultation."
              : `General health notes or medical background for ${target.patientName}.`}
          </DialogDescription>
        </DialogHeader>

        {isAppointment && (
          <div className="bg-muted/40 p-2.5 rounded-lg border border-border/40 text-xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1 tabular-nums">
                <Calendar className="size-3" />
                {format(new Date(target.appointment.startTime), "d MMM yyyy, h:mm a")}
              </span>
              <span className="flex items-center gap-1 font-medium text-foreground">
                <User className="size-3" />
                Dr. {target.appointment.doctor.fullName}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-2.5 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5 py-1">
          <Label htmlFor="notes-textarea" className="text-xs font-medium">
            Notes Content
          </Label>
          <Textarea
            id="notes-textarea"
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              isAppointment
                ? "Enter symptoms, examination notes, treatment plan, or internal comments..."
                : "Enter medical history, known conditions, or notes..."
            }
            maxLength={2000}
            className="text-xs resize-none"
          />
          <div className="text-[11px] text-muted-foreground text-right">
            {notes.length} / 2000 characters
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-8 text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting}
            className="h-8 text-xs"
          >
            {isSubmitting ? "Saving..." : "Save Notes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
