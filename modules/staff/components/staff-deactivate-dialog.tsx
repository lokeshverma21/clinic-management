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

import { Button } from "@/components/ui/button"

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
      <AlertDialogContent className="max-w-md rounded-xl border-border/60">
        <AlertDialogHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Archive className="h-6 w-6 text-destructive" />
          </div>

          <AlertDialogTitle>
            Deactivate Staff Member
          </AlertDialogTitle>

          <AlertDialogDescription className="space-y-3 text-sm leading-relaxed">
            <p>
              Are you sure you want to deactivate{" "}
              <span className="font-medium text-foreground">
                {staffName}
              </span>
              ?
            </p>

            <p>
              This staff member will no longer be able to access the clinic,
              but their historical records, appointments and audit history
              will remain intact.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {warning !== null && (
          <div className="rounded-lg border border-amber-300/40 bg-amber-500/10 p-4">
            <div className="flex gap-3">
              <CalendarClock className="mt-0.5 h-5 w-5 text-amber-600" />

              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Upcoming appointments found
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  This staff member still has{" "}
                  <strong>{warning}</strong> upcoming appointment
                  {warning > 1 ? "s" : ""}.
                  Reassign or cancel them if necessary.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />

              <p className="text-sm text-destructive">
                {error}
              </p>
            </div>
          </div>
        )}

        <AlertDialogFooter className="pt-2">
          <AlertDialogCancel
            disabled={loading}
            className="h-10"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction               
              onClick={handleDeactivate}
              disabled={loading}
              className="h-10"  >
            {/* <Button */}
              {/* variant="destructive" */}

              {/* className="h-10" */}
            {/* > */}
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  Deactivate Staff
                </>
              )}
            {/* </Button> */}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}