// modules/staff/components/staff-deactivate-dialog.tsx
"use client"

import * as React from "react"
import {
  AlertTriangle,
  Loader2,
  Archive,
  CalendarClock,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DeactivateStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  membershipId: string
  staffName: string
  onSuccess?: () => void
}

export function DeactivateStaffDialog({
  open,
  onOpenChange,
  membershipId,
  staffName,
  onSuccess,
}: DeactivateStaffDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [warning, setWarning] = React.useState<number | null>(null)

  async function handleDeactivate() {
    setLoading(true)
    setError("")
    setWarning(null)

    try {
      const response = await fetch(`/api/staff/${membershipId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message ?? "Failed to deactivate staff.")
      }

      if (result.data?.upcomingAppointmentsCount > 0) {
        setWarning(result.data.upcomingAppointmentsCount)
      } else {
        onOpenChange(false)
      }

      onSuccess?.()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Something went wrong.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-xl border-border/60 p-6">
        <AlertDialogHeader className="space-y-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Archive className="size-5" />
          </div>

          <AlertDialogTitle className="text-lg font-semibold tracking-tight text-foreground">
            Deactivate staff member
          </AlertDialogTitle>

          <AlertDialogDescription className="space-y-2 text-xs text-muted-foreground leading-relaxed text-left">
            <p>
              Are you sure you want to deactivate{" "}
              <span className="font-semibold text-foreground">
                {staffName}
              </span>
              ?
            </p>
            <p className="p-3 rounded-lg bg-muted/40 border border-border/60 text-muted-foreground">
              <strong>Consequences:</strong> The member will immediately lose access to ClinicSeva.
              Their past consultations, patient history, notes, and audit records will remain completely intact.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {warning !== null && (
          <div className="rounded-lg border border-warning/25 bg-warning/10 p-3.5 mt-2">
            <div className="flex gap-2.5 items-start">
              <CalendarClock className="size-4 text-warning shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-warning">
                  Upcoming appointments found
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This staff member has{" "}
                  <strong className="text-foreground">{warning}</strong> upcoming appointment
                  {warning > 1 ? "s" : ""}. Please reassign or reschedule them as needed.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 mt-2 flex items-start gap-2">
            <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-destructive leading-relaxed">{error}</p>
          </div>
        )}

        <AlertDialogFooter className="pt-3 gap-2">
          <AlertDialogCancel
            disabled={loading}
            className="h-9 text-xs"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDeactivate}
            disabled={loading}
            className={cn(
              buttonVariants({ variant: "destructive", size: "sm" }),
              "h-9 text-xs gap-1.5"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Deactivating...</span>
              </>
            ) : (
              <>
                <Archive className="size-3.5" />
                <span>Deactivate member</span>
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}