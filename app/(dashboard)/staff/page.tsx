"use client"
import { StaffInviteDialog } from '@/modules/staff/components/staff-invite-dialog';
import { StaffHeader } from '@/modules/staff/components/staff-header'
import { StaffTable } from '@/modules/staff/components/staff-table';
import { StaffToolbar } from '@/modules/staff/components/staff-toolbar';
import React from 'react'
import { StaffListItem } from '@/modules/staff/staff.types';
import { StaffEditDialog } from '@/modules/staff/components/staff-edit-sdialog';
import { DeactivateStaffDialog } from '@/modules/staff/components/staff-deactivate-dialog';

function StaffPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false)
  const [deactivateOpen, setDeactivateOpen] = React.useState(false)
  const [selectedStaff, setSelectedStaff] = React.useState<StaffListItem | null>(null)
  const [dialogMode, setDialogMode] = React.useState<'add' | 'edit'>('add');

  const [staff, setStaff] = React.useState<StaffListItem[]>([])

 React.useEffect(() => {
  async function fetchStaff() {
    try {
      const res = await fetch("/api/staff")

      if (!res.ok) {
        throw new Error("Failed to load staff")
      }

      const result = await res.json()
      setStaff(result.data.staff)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  fetchStaff()
}, [])

const refreshStaff = React.useCallback(async () => {
  try {
    const res = await fetch("/api/staff")

    if (!res.ok) return

    const result = await res.json()
    setStaff(result.data.staff)
  } catch (err) {
    console.error(err)
  }
}, [])

  const handleAddStaff = () => {
    setDialogMode('add');
    setInviteOpen(true);
  };

  const handleEditStaff = (staff: StaffListItem) => {
    setSelectedStaff(staff)
    setEditOpen(true)
  }

  const handleDeactivateStaff = (staff: StaffListItem) => {
    setSelectedStaff(staff)
    setDeactivateOpen(true)
  }

  return (
    <div className="container p-4 sm:p-6 lg:p-2 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <StaffHeader onAddStaff={handleAddStaff} />

      <div className="space-y-4">
        <StaffToolbar />
        <StaffTable
          staff={staff}
          onViewStaff={() => {}}
          onEditStaff={handleEditStaff}
          onArchiveStaff={handleDeactivateStaff}
        />
      </div>

      <StaffInviteDialog 
        open={inviteOpen} 
        onOpenChange={setInviteOpen} 
        mode={"add"}
      />

      <StaffEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        staff={selectedStaff}
        onSuccess={refreshStaff}
      />

      <DeactivateStaffDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        membershipId={selectedStaff?.membershipId ?? ""}
        staffName={selectedStaff?.user?.fullName ?? "Unknown"}
        onSuccess={refreshStaff}
      />
    </div>
  )
}

export default StaffPage