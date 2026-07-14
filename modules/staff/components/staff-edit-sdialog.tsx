"use client"

import * as React from "react"
import {
  Loader2,
  Briefcase,
  Palette,
  UserCog,
  AlertCircle,
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
import { ScrollArea } from "@/components/ui/scroll-area"

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
  onSuccess?: () => void
}

export function StaffEditDialog({
  open,
  onOpenChange,
  staff,
  onSuccess,
}: StaffEditDialogProps) {
  if (!staff) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 
        1. h-[90vh] ensures the dialog has a fixed max height.
        2. overflow-hidden is mandatory on the container so the child ScrollArea can handle the overflow instead.
      */}
      <DialogContent 
        key={staff.membershipId} 
        className="flex h-full max-h-[90vh] flex-col p-0 sm:max-w-2xl overflow-hidden"
      >
        <StaffEditForm 
          staff={staff} 
          onClose={() => onOpenChange(false)} 
          onSuccess={onSuccess} 
        />
      </DialogContent>
    </Dialog>
  )
}

function StaffEditForm({ 
  staff, 
  onClose, 
  onSuccess 
}: { 
  staff: StaffListItem; 
  onClose: () => void; 
  onSuccess?: () => void 
}) {
  const [role, setRole] = React.useState<MembershipRole>(staff.role)
  const [specialization, setSpecialization] = React.useState(staff.staffProfile?.specialization ?? "")
  const [colorTag, setColorTag] = React.useState(staff.staffProfile?.colorTag ?? "")
  const [workingHours, setWorkingHours] = React.useState<WorkingHours | null>(staff.staffProfile?.workingHours ?? null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log(JSON.stringify({
          role,
          specialization: specialization.trim() || null,
          colorTag: colorTag.trim() || null,
          workingHours,
        }),)
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
      console.log(result)
      if (!response.ok) throw new Error(result.error?.message ?? "Failed to update staff.")

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    /* 
       'flex-1 min-h-0' on the form is the secret to making 
       the internal ScrollArea actually scroll. 
    */
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-border/40">
        <DialogTitle>Edit Staff Member</DialogTitle>
        <DialogDescription>
          Update staff role, specialization, availability and preferences.
        </DialogDescription>
      </DialogHeader>

      {/* 
        We use flex-1 to take up all available space between header and footer.
        ScrollArea needs a height context to work; flex-1 provides that here.
      */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="space-y-6 px-6 py-6">
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Role
              </Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as MembershipRole)}
              >
                <SelectTrigger className="h-10">
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
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Color Tag
              </Label>
              <div className="relative">
                <Palette className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="#3B82F6"
                  value={colorTag}
                  onChange={(e) => setColorTag(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
              Specialization
            </Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cardiologist"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </div>

          <div className="pt-2">
            <WorkingHoursEditor
              value={workingHours}
              onChange={setWorkingHours}
            />
          </div>
        </div>
      </ScrollArea>

      <DialogFooter className="bg-muted/30 px-6 py-4 flex-shrink-0 border-t border-border/40">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="min-w-[140px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <UserCog className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}