// modules/staff/components/staff-edit-dialog.tsx
"use client"

import * as React from "react"
import {
  Briefcase,
  Palette,
  AlertCircle,
  ShieldAlert,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { WorkingHoursEditor } from "./staff-working-hour-editor"
import type {
  MembershipRole,
  WorkingHours,
  StaffListItem,
} from "../staff.types"

interface StaffEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: StaffListItem | null
  currentMembershipId?: string
  onSuccess?: () => void
}

export function StaffEditDialog({
  open,
  onOpenChange,
  staff,
  currentMembershipId,
  onSuccess,
}: StaffEditDialogProps) {
  if (!staff) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        key={staff.membershipId}
        className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden border-border/60 rounded-xl p-0 shadow-lg sm:max-w-2xl"
      >
        <StaffEditForm
          staff={staff}
          currentMembershipId={currentMembershipId}
          onClose={() => onOpenChange(false)}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}

function StaffEditForm({
  staff,
  currentMembershipId,
  onClose,
  onSuccess,
}: {
  staff: StaffListItem
  currentMembershipId?: string
  onClose: () => void
  onSuccess?: () => void
}) {
  const [role, setRole] = React.useState<MembershipRole>(staff.role)
  const [specialization, setSpecialization] = React.useState(
    staff.staffProfile?.specialization ?? ""
  )
  const [colorTag, setColorTag] = React.useState(
    staff.staffProfile?.colorTag ?? ""
  )
  const [workingHours, setWorkingHours] = React.useState<WorkingHours | null>(
    staff.staffProfile?.workingHours ?? null
  )
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const isSelf = currentMembershipId === staff.membershipId
  const roleChanged = role !== staff.role

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/staff/${staff.membershipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          specialization: specialization.trim() || null,
          colorTag: colorTag.trim() || null,
          workingHours,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error?.message ?? "Failed to update staff.")
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <DialogHeader className="p-6 pb-4 shrink-0 border-b border-border/40">
        <DialogTitle className="text-xl font-semibold tracking-tight">
          Edit Staff Member
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Update role, specialization, color badge and weekly availability for{" "}
          <span className="font-medium text-foreground">
            {staff.user?.fullName ?? staff.invitedEmail ?? "this member"}
          </span>
          .
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-destructive/25 bg-destructive/10 p-3.5">
              <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-destructive leading-relaxed">{error}</p>
            </div>
          )}

          {/* Role and Color Tag row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as MembershipRole)}
                disabled={isSelf || loading}
              >
                <SelectTrigger className="h-9 bg-background text-xs" aria-label="Select role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {staff.role === "owner" && (
                    <SelectItem value="owner">Owner</SelectItem>
                  )}
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
              {isSelf && (
                <p className="text-[11px] text-muted-foreground">
                  You cannot change your own role. Ask another owner to change your access.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Color Tag</Label>
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Palette className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="e.g. blue, teal, or custom"
                    value={colorTag}
                    onChange={(e) => setColorTag(e.target.value)}
                    disabled={loading}
                    className="pl-8 h-9 text-xs bg-background"
                  />
                </div>
                {colorTag && (
                  <span
                    className="size-7 rounded-md border border-border/60 shrink-0"
                    style={{ backgroundColor: colorTag }}
                    title={`Color: ${colorTag}`}
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Role change warning banner */}
          {roleChanged && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-warning/25 bg-warning/10 text-xs">
              <ShieldAlert className="size-4 text-warning shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-warning">
                  Role Change Confirmation Notice
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Changing role from <span className="capitalize font-medium text-foreground">{staff.role}</span> to{" "}
                  <span className="capitalize font-medium text-foreground">{role}</span> alters clinical access
                  permissions immediately upon saving.
                </p>
              </div>
            </div>
          )}

          {/* Specialization */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">Specialization</Label>
            <div className="relative">
              <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="e.g. General Dentistry, Orthodontics, Cardiology"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                disabled={loading}
                className="pl-8 h-9 text-xs bg-background"
              />
            </div>
          </div>

          {/* Working Hours Editor */}
          <div className="pt-2">
            <WorkingHoursEditor
              value={workingHours}
              onChange={setWorkingHours}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <DialogFooter className="bg-muted/30 p-4 border-t border-border/40 flex items-center justify-end gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={onClose}
          className="h-9 text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={loading}
          className="h-9 text-xs"
        >
          {loading ? "Saving changes..." : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  )
}
