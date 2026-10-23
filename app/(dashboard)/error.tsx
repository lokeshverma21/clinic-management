"use client";

import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    console.error("Dashboard error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-xl border border-destructive/20 bg-card shadow-xs">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto">
          <AlertCircle className="size-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Something went wrong
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An unexpected error occurred while loading this section. Please try again.
          </p>
        </div>

        <div className="pt-2">
          <Button
            onClick={reset}
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs h-9 border-destructive/30 hover:bg-destructive/10 text-destructive font-medium"
          >
            <RotateCcw className="size-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    </div>
  );
}