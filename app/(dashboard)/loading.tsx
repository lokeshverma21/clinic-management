import * as React from "react";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">Loading workspace...</p>
          <p className="text-xs text-muted-foreground">
            Please wait while we prepare your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}