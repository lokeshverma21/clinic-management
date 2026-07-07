"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PatientHeaderProps {
  onAddPatient: () => void;
}

export function PatientHeader({ onAddPatient }: PatientHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Patients</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage patient records and medical information.
        </p>
      </div>
      <Button 
        onClick={onAddPatient}
        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Patient
      </Button>
    </div>
  )
}
