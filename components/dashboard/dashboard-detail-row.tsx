import * as React from "react"
import { cn } from "@/lib/utils"

export interface DashboardDetailRowProps {
  label: string
  value?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  className?: string
  valueClassName?: string
  tabular?: boolean
}

export function DashboardDetailRow({
  label,
  value,
  icon: Icon,
  className,
  valueClassName,
  tabular = false,
}: DashboardDetailRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-border/40 gap-1 text-sm last:border-0",
        className
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium shrink-0">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        <span>{label}</span>
      </div>
      <div
        className={cn(
          "text-foreground font-medium text-sm text-left sm:text-right truncate",
          tabular && "tabular-nums",
          valueClassName
        )}
      >
        {value ?? <span className="text-muted-foreground italic font-normal text-xs">Not specified</span>}
      </div>
    </div>
  )
}
