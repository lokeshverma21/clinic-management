"use client";

import * as React from "react";
import { Bell } from "lucide-react";

export function NotificationsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border/80 bg-card/50 animate-in fade-in duration-300">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <Bell className="size-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">No Notifications Found</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
        No reminder or confirmation notifications match your current filter criteria.
      </p>
    </div>
  );
}
