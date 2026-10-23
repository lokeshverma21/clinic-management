"use client"

import * as React from "react"
import { Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"

interface PatientEmptyStateProps {
  onAddPatient: () => void
}

export function PatientEmptyState({ onAddPatient }: PatientEmptyStateProps) {
  return (
    <DashboardEmptyState
      icon={Users}
      title="No patients found"
      description="Add your first patient to start managing consultations, appointments, and billing history."
      action={
        <Button onClick={onAddPatient} className="h-9 gap-2 text-sm font-medium">
          <Plus className="size-4" />
          <span>Add patient</span>
        </Button>
      }
      className="my-6"
    />
  )
}
