"use client"

import * as React from "react"
import { Building2 } from "lucide-react"

export function ClinicsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-border/60 rounded-xl bg-muted/5 animate-in fade-in duration-300">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
        <Building2 size={24} />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">No clinics registered</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Tenant clinics created by clinic owners during onboarding will appear here for oversight and administration.
      </p>
    </div>
  )
}
