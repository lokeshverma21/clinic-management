// modules/staff/components/staff-header.tsx
"use client"

import * as React from "react"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"

interface StaffHeaderProps {
  onAddStaff: () => void
  canInvite?: boolean
}

export function StaffHeader({ onAddStaff, canInvite = true }: StaffHeaderProps) {
  return (
    <DashboardPageHeader
      title="Staff"
      description="Manage doctors, receptionists, access roles, and clinic schedules."
    >
      {canInvite && (
        <Button
          onClick={onAddStaff}
          className="gap-2 shadow-xs"
        >
          <UserPlus className="size-4" />
          <span>Invite staff</span>
        </Button>
      )}
    </DashboardPageHeader>
  )
}
