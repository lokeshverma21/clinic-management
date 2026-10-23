import * as React from "react";
import { cn } from "@/lib/utils";

interface DashboardPageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function DashboardPageHeader({
  title,
  description,
  badge,
  children,
  className,
}: DashboardPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-sans">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2.5 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
