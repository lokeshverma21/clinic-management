"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"

interface AuditLogsHeaderProps {
  totalCount?: number;
}

export function AuditLogsHeader({ totalCount }: AuditLogsHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Audit Logs</h1>
          {typeof totalCount === "number" && (
            <Badge variant="secondary" className="font-mono text-xs">
              {totalCount} {totalCount === 1 ? "event" : "events"}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Platform-level audit trail recording administrative actions, membership changes, and tenant events.
        </p>
      </div>
    </div>
  )
}
