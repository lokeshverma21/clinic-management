"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"

interface PatientHeaderProps {
  onAddPatient: () => void
}

export function PatientHeader({ onAddPatient }: PatientHeaderProps) {
  return (
    <DashboardPageHeader
      title="Patients"
      description="Manage patient records, medical history, and directory."
    >
      <Button 
        onClick={onAddPatient}
        className="h-9 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs text-sm font-medium"
      >
        <Plus className="size-4" />
        <span>Add patient</span>
      </Button>
    </DashboardPageHeader>
  )
}
