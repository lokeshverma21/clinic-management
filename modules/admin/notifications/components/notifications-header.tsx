"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface NotificationsHeaderProps {
  totalCount?: number;
}

export function NotificationsHeader({ totalCount }: NotificationsHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Notifications Monitor
            </h1>
            {typeof totalCount === "number" && (
              <Badge variant="secondary" className="font-mono text-xs">
                {totalCount} {totalCount === 1 ? "notification" : "notifications"}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Read-only delivery monitor of reminder and confirmation notifications across all clinics.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 border border-border/50 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 text-primary" />
        <span>
          Reminders are processed by the daily scheduled job, so a few hours of delay is normal.
          Rows are marked overdue after 24 hours.
        </span>
      </div>
    </div>
  );
}
