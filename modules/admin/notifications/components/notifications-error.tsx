"use client";

import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationsErrorProps {
  message?: string;
  onRetry: () => void;
}

export function NotificationsError({
  message = "Failed to load notifications data. Please check platform logs or try again.",
  onRetry,
}: NotificationsErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-destructive/20 bg-destructive/5 animate-in fade-in duration-300">
      <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
        <AlertCircle className="size-5" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">Error Loading Notifications</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-md">{message}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="mt-4 gap-1.5 text-xs h-8 border-destructive/30 hover:bg-destructive/10"
      >
        <RotateCcw className="size-3.5" />
        Retry Request
      </Button>
    </div>
  );
}
