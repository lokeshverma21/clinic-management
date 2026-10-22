"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"

interface ClinicsHeaderProps {
  totalCount?: number;
}

export function ClinicsHeader({ totalCount }: ClinicsHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Clinics</h1>
          {typeof totalCount === "number" && (
            <Badge variant="secondary" className="font-mono text-xs">
              {totalCount} {totalCount === 1 ? "clinic" : "clinics"}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor all platform tenant clinics, subscription health, onboarding progress, and lifecycle status.
        </p>
      </div>
    </div>
  )
}
