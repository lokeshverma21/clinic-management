"use client"

import * as React from "react"
import { useUser } from "@clerk/nextjs"
import { StaffHeader } from "@/modules/staff/components/staff-header"
import { StaffToolbar } from "@/modules/staff/components/staff-toolbar"
import { StaffTable } from "@/modules/staff/components/staff-table"
import { StaffInviteDialog } from "@/modules/staff/components/staff-invite-dialog"
import { StaffEditDialog } from "@/modules/staff/components/staff-edit-dialog"
import { StaffViewDialog } from "@/modules/staff/components/staff-view-dialog"
import { DeactivateStaffDialog } from "@/modules/staff/components/staff-deactivate-dialog"
import type { StaffListItem } from "@/modules/staff/staff.types"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import { Button } from "@/components/ui/button"

export default function StaffPage() {
  const { user } = useUser()
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const [staff, setStaff] = React.useState<StaffListItem[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("all")

  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [viewOpen, setViewOpen] = React.useState(false)
  const [deactivateOpen, setDeactivateOpen] = React.useState(false)
  const [selectedStaff, setSelectedStaff] = React.useState<StaffListItem | null>(null)

  const fetchStaff = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setHasError(false)
      const res = await fetch("/api/staff")
      if (!res.ok) {
        throw new Error("Failed to load staff")
      }
      const result = await res.json()
      setStaff(result.data.staff || [])
    } catch (err) {
      console.error(err)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  const refreshStaff = React.useCallback(async () => {
    try {
      const res = await fetch("/api/staff")
      if (!res.ok) return
      const result = await res.json()
      setStaff(result.data.staff || [])
    } catch (err) {
      console.error(err)
    }
  }, [])

  // Resolve current user's membership and role from Clerk
  const currentEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase()
  const currentMember = staff.find((s) => {
    const memberEmail = (s.user?.email || s.invitedEmail || "").toLowerCase()
    return currentEmail && memberEmail === currentEmail
  })
  const currentMembershipId = currentMember?.membershipId
  const currentRole = currentMember?.role

  const handleAddStaff = () => {
    setInviteOpen(true)
  }

  const handleViewStaff = (member: StaffListItem) => {
    setSelectedStaff(member)
    setViewOpen(true)
  }

  const handleEditStaff = (member: StaffListItem) => {
    setSelectedStaff(member)
    setEditOpen(true)
  }

  const handleDeactivateStaff = (member: StaffListItem) => {
    setSelectedStaff(member)
    setDeactivateOpen(true)
  }

  const filteredStaff = React.useMemo(() => {
    return staff.filter((member) => {
      const q = searchQuery.toLowerCase().trim()
      const name = (member.user?.fullName || "Pending Invite").toLowerCase()
      const email = (member.user?.email || member.invitedEmail || "").toLowerCase()
      const matchesQuery = !q || name.includes(q) || email.includes(q)
      const matchesRole = roleFilter === "all" || member.role === roleFilter
      return matchesQuery && matchesRole
    })
  }, [staff, searchQuery, roleFilter])

  if (isLoading && staff.length === 0 && !hasError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (hasError && staff.length === 0) {
    return (
      <div className="space-y-6">
        <StaffHeader onAddStaff={handleAddStaff} canInvite={!currentRole || currentRole === "owner"} />
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8">
          <DashboardEmptyState
            icon={AlertCircle}
            title="Failed to load staff directory"
            description="There was a problem loading clinic staff members. Please try again."
            action={
              <Button onClick={fetchStaff} variant="outline" className="gap-2 shadow-xs">
                Try again
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <StaffHeader
        onAddStaff={handleAddStaff}
        canInvite={!currentRole || currentRole === "owner"}
      />

      <div className="space-y-4">
        <StaffToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          onRefresh={fetchStaff}
          isRefreshing={isLoading}
        />

        <StaffTable
          staff={filteredStaff}
          onViewStaff={handleViewStaff}
          onEditStaff={handleEditStaff}
          onArchiveStaff={handleDeactivateStaff}
          currentMembershipId={currentMembershipId}
          currentRole={currentRole}
        />
      </div>

      <StaffInviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        mode="add"
        onSuccess={refreshStaff}
      />

      <StaffViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        staff={selectedStaff}
        isSelf={selectedStaff?.membershipId === currentMembershipId}
      />

      <StaffEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        staff={selectedStaff}
        currentMembershipId={currentMembershipId}
        onSuccess={refreshStaff}
      />

      <DeactivateStaffDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        membershipId={selectedStaff?.membershipId ?? ""}
        staffName={selectedStaff?.user?.fullName ?? selectedStaff?.invitedEmail ?? "Staff member"}
        onSuccess={refreshStaff}
      />
    </div>
  )
}