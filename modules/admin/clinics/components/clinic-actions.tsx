"use client"

import * as React from "react"
import { AlertTriangle, CheckCircle, Clock, ShieldAlert, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { AdminClinicDetail } from "../clinics.types"

interface ClinicActionsProps {
  clinic: AdminClinicDetail;
  canWrite: boolean;
  onActionComplete: () => void;
}

export function ClinicActions({
  clinic,
  canWrite,
  onActionComplete,
}: ClinicActionsProps) {
  // Action dialog states
  const [isSuspendOpen, setIsSuspendOpen] = React.useState(false)
  const [suspendReason, setSuspendReason] = React.useState("")
  const [isSuspendLoading, setIsSuspendLoading] = React.useState(false)
  const [suspendError, setSuspendError] = React.useState("")

  const [isReactivateOpen, setIsReactivateOpen] = React.useState(false)
  const [reactivateReason, setReactivateReason] = React.useState("")
  const [isReactivateLoading, setIsReactivateLoading] = React.useState(false)
  const [reactivateError, setReactivateError] = React.useState("")

  const [isExtendTrialOpen, setIsExtendTrialOpen] = React.useState(false)
  const [extendDays, setExtendDays] = React.useState("14")
  const [extendReason, setExtendReason] = React.useState("")
  const [isExtendLoading, setIsExtendLoading] = React.useState(false)
  const [extendError, setExtendError] = React.useState("")

  const canSuspend =
    canWrite && (clinic.status === "trial" || clinic.status === "active" || clinic.status === "past_due")
  const canReactivate = canWrite && clinic.status === "suspended"
  const canExtendTrial = canWrite && clinic.status === "trial"

  // 1. Suspend Handler
  const handleSuspend = async () => {
    if (suspendReason.trim().length < 5) {
      setSuspendError("Please provide a reason of at least 5 characters.")
      return
    }

    try {
      setIsSuspendLoading(true)
      setSuspendError("")
      const res = await fetch(`/api/admin/clinics/${clinic.id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: suspendReason.trim() }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? "Failed to suspend clinic")
      }
      setIsSuspendOpen(false)
      setSuspendReason("")
      onActionComplete()
    } catch (err: unknown) {
      setSuspendError(err instanceof Error ? err.message : "Failed to suspend clinic")
    } finally {
      setIsSuspendLoading(false)
    }
  }

  // 2. Reactivate Handler
  const handleReactivate = async () => {
    try {
      setIsReactivateLoading(true)
      setReactivateError("")
      const res = await fetch(`/api/admin/clinics/${clinic.id}/reactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reactivateReason.trim() || undefined }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? "Failed to reactivate clinic")
      }
      setIsReactivateOpen(false)
      setReactivateReason("")
      onActionComplete()
    } catch (err: unknown) {
      setReactivateError(err instanceof Error ? err.message : "Failed to reactivate clinic")
    } finally {
      setIsReactivateLoading(false)
    }
  }

  // 3. Extend Trial Handler
  const handleExtendTrial = async () => {
    const days = parseInt(extendDays, 10)
    if (isNaN(days) || days < 1 || days > 90) {
      setExtendError("Please enter a valid number of days between 1 and 90.")
      return
    }

    try {
      setIsExtendLoading(true)
      setExtendError("")
      const res = await fetch(`/api/admin/clinics/${clinic.id}/extend-trial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days,
          reason: extendReason.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? "Failed to extend trial")
      }
      setIsExtendTrialOpen(false)
      setExtendReason("")
      onActionComplete()
    } catch (err: unknown) {
      setExtendError(err instanceof Error ? err.message : "Failed to extend trial")
    } finally {
      setIsExtendLoading(false)
    }
  }

  return (
    <>
      <Card className="shadow-none border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <span>Administrative Actions</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Manage tenant account lifecycle, status overrides, and trial grants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!canWrite ? (
            <p className="text-xs text-muted-foreground italic py-1">
              Platform support accounts have read-only permissions. Status changes require a super_admin account.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              {/* Suspend Button */}
              {clinic.status !== "suspended" && (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!canSuspend}
                  onClick={() => setIsSuspendOpen(true)}
                  className="gap-1.5"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Suspend Clinic
                </Button>
              )}

              {/* Reactivate Button */}
              {clinic.status === "suspended" && (
                <Button
                  variant="default"
                  size="sm"
                  disabled={!canReactivate}
                  onClick={() => setIsReactivateOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Reactivate Clinic
                </Button>
              )}

              {/* Extend Trial Button */}
              <Button
                variant="outline"
                size="sm"
                disabled={!canExtendTrial}
                onClick={() => setIsExtendTrialOpen(true)}
                className="gap-1.5"
              >
                <Clock className="h-3.5 w-3.5" />
                Extend Trial
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. Suspend Dialog */}
      <Dialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>Suspend Clinic</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Suspending <strong className="text-foreground">{clinic.name}</strong> will immediately revoke access for all clinic staff and doctors. Background reminders and automated jobs will halt.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label htmlFor="suspend-reason" className="text-xs font-medium text-foreground">
                Suspension Reason (Required, 5–500 chars)
              </label>
              <Textarea
                id="suspend-reason"
                placeholder="Specify the operational or policy reason for suspension..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>

            {suspendError && (
              <p className="text-xs font-medium text-destructive">{suspendError}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isSuspendLoading}
              onClick={() => setIsSuspendOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isSuspendLoading || suspendReason.trim().length < 5}
              onClick={handleSuspend}
            >
              {isSuspendLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Confirm Suspension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Reactivate Dialog */}
      <Dialog open={isReactivateOpen} onOpenChange={setIsReactivateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
              <span>Reactivate Clinic</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Reactivating <strong className="text-foreground">{clinic.name}</strong> will restore access. The resulting status will be evaluated from current subscription and trial state.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label htmlFor="reactivate-reason" className="text-xs font-medium text-foreground">
                Reason / Note (Optional)
              </label>
              <Input
                id="reactivate-reason"
                placeholder="e.g. Terms violation resolved, payment cleared..."
                value={reactivateReason}
                onChange={(e) => setReactivateReason(e.target.value)}
                className="text-xs"
              />
            </div>

            {reactivateError && (
              <p className="text-xs font-medium text-destructive">{reactivateError}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isReactivateLoading}
              onClick={() => setIsReactivateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={isReactivateLoading}
              onClick={handleReactivate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isReactivateLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Confirm Reactivation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Extend Trial Dialog */}
      <Dialog open={isExtendTrialOpen} onOpenChange={setIsExtendTrialOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Extend Clinic Trial</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Grant additional trial days to <strong className="text-foreground">{clinic.name}</strong>. The extension is calculated from the current trial end date (or today, whichever is later).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label htmlFor="extend-days" className="text-xs font-medium text-foreground">
                Days to Extend (1 to 90)
              </label>
              <Input
                id="extend-days"
                type="number"
                min="1"
                max="90"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="extend-reason" className="text-xs font-medium text-foreground">
                Reason / Note (Optional)
              </label>
              <Input
                id="extend-reason"
                placeholder="e.g. Granted onboarding extension via support ticket #120"
                value={extendReason}
                onChange={(e) => setExtendReason(e.target.value)}
                className="text-xs"
              />
            </div>

            {extendError && (
              <p className="text-xs font-medium text-destructive">{extendError}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isExtendLoading}
              onClick={() => setIsExtendTrialOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={isExtendLoading}
              onClick={handleExtendTrial}
            >
              {isExtendLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Confirm Extension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
