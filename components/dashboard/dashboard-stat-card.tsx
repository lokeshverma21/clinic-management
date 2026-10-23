import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconClass?: string;
  badge?: React.ReactNode;
  className?: string;
}

export function DashboardStatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  badge,
  className,
}: DashboardStatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-200",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground truncate">
            {title}
          </span>
          {Icon && (
            <span
              className={cn(
                "inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
                iconClass,
              )}
            >
              <Icon className="size-4" />
            </span>
          )}
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
            {value}
          </span>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
