"use client"

import * as React from "react"
import { Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PatientEmptyStateProps {
  onAddPatient: () => void;
}

export function PatientEmptyState({ onAddPatient }: PatientEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-border/60 rounded-xl bg-muted/5">
      <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4">
        <Users size={24} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">No patients found</h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
        Add your first patient to start managing appointments and clinical records.
      </p>
      <Button onClick={onAddPatient} className="gap-2">
        <Plus size={16} />
        Add Patient
      </Button>
    </div>
  )
}
