// modules/staff/components/staff-invite-dialog.tsx
"use client"

import * as React from "react"
import { Mail, UserPlus, Loader2 } from "lucide-react"
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

interface StaffInviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "add"
  onSuccess?: () => void
}

export function StaffInviteDialog({
  open,
  onOpenChange,
  mode: _mode = "add",
  onSuccess,
}: StaffInviteDialogProps) {
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<"doctor" | "receptionist">("doctor")
  const [error, setError] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/staff/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          role,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error?.message ?? "Failed to send invitation.")
      }

      setEmail("")
      setRole("doctor")
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/60 shadow-lg p-0 overflow-hidden rounded-xl flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b border-border/40 shrink-0">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Invite Staff Member
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Send an invitation email to add a doctor or receptionist to your clinic.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="p-6 space-y-4">
              {error && (
                <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-xs font-medium text-destructive leading-relaxed">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="staff-invite-email" className="text-xs font-medium text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="staff-invite-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@example.com"
                    className="pl-9 h-9 bg-background text-xs"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="staff-invite-role" className="text-xs font-medium text-foreground">
                  Role
                </Label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as "doctor" | "receptionist")}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="staff-invite-role" className="h-9 bg-background text-xs" aria-label="Select role">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor" className="text-xs">
                      Doctor (Manages consultations and medical records)
                    </SelectItem>
                    <SelectItem value="receptionist" className="text-xs">
                      Receptionist (Manages appointments and registrations)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-muted/30 p-4 border-t border-border/40 flex items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-9 text-xs gap-1.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Sending Invitation...</span>
                </>
              ) : (
                <>
                  <UserPlus className="size-3.5" />
                  <span>Send Invitation</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
