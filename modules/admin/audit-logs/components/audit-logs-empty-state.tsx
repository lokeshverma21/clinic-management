"use client"

import * as React from "react"
import { ScrollText } from "lucide-react"

export function AuditLogsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-border/60 rounded-xl bg-muted/5 animate-in fade-in duration-300">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
        <ScrollText size={24} />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">No audit logs recorded</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Platform administrative actions, clinic suspension toggles, and staff role adjustments will automatically appear here.
      </p>
    </div>
  )
}
