import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface DashboardSectionCardProps {
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
  badge?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
  headerClassName?: string
}

export function DashboardSectionCard({
  title,
  description,
  icon: Icon,
  action,
  badge,
  children,
  className,
  contentClassName,
  headerClassName,
}: DashboardSectionCardProps) {
  const hasHeader = title || description || action || badge

  return (
    <Card
      className={cn(
        "rounded-lg border border-border/60 bg-card shadow-xs transition-colors",
        className
      )}
    >
      {hasHeader && (
        <CardHeader
          className={cn(
            "p-5 pb-3 border-b border-border/40 flex flex-row items-center justify-between gap-3 space-y-0",
            headerClassName
          )}
        >
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="size-4 text-muted-foreground shrink-0" />}
              {title && (
                <CardTitle className="text-base font-semibold tracking-tight text-foreground truncate">
                  {title}
                </CardTitle>
              )}
              {badge}
            </div>
            {description && (
              <CardDescription className="text-xs text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("p-5", !hasHeader && "p-5", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}
