"use client"

import * as React from "react"
import { format } from "date-fns"
import { History, Clock, User, Code } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AdminAuditLogWithActor } from "@/modules/admin/audit-logs"

interface ClinicRecentActivityProps {
  clinicId: string;
}

export function ClinicRecentActivity({ clinicId }: ClinicRecentActivityProps) {
  const [logs, setLogs] = React.useState<AdminAuditLogWithActor[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedMetadata, setSelectedMetadata] = React.useState<{
    action: string;
    data: unknown;
  } | null>(null)

  const loadActivity = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/audit-logs?clinicId=${clinicId}&pageSize=10`)
      const json = await res.json()
      if (res.ok && json.success) {
        setLogs(json.data.logs ?? [])
      }
    } catch (err) {
      console.error("Failed to load clinic audit activity:", err)
    } finally {
      setIsLoading(false)
    }
  }, [clinicId])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      void loadActivity()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadActivity])

  return (
    <Card className="shadow-none border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <span>Recent Administrative Activity</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs font-mono">
            Last 10 Events
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Platform-level audit events recorded for this clinic.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
            Loading audit activity...
          </div>
        ) : logs.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-3">
            No administrative audit events recorded for this clinic yet.
          </p>
        ) : (
          <div className="divide-y divide-border/40">
            {logs.map((log) => {
              const formattedDate = format(new Date(log.createdAt), "MMM d, yyyy HH:mm");
              const hasMetadata =
                log.metadata !== null &&
                typeof log.metadata === "object" &&
                Object.keys(log.metadata).length > 0;

              return (
                <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {log.action}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" />
                        {formattedDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[240px]">{log.actor?.fullName ?? log.actorEmail}</span>
                    </div>
                  </div>

                  {hasMetadata && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1 shrink-0"
                      onClick={() => setSelectedMetadata({ action: log.action, data: log.metadata })}
                    >
                      <Code className="h-3.5 w-3.5" />
                      Payload
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Metadata Dialog */}
        <Dialog
          open={selectedMetadata !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedMetadata(null);
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <span>Event Payload</span>
                {selectedMetadata && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {selectedMetadata.action}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Audit payload metadata recorded with this action.
              </DialogDescription>
            </DialogHeader>

            {selectedMetadata && (
              <div className="mt-2 rounded-lg bg-muted/60 p-4 border border-border/50 overflow-x-auto">
                <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all">
                  {JSON.stringify(selectedMetadata.data, null, 2)}
                </pre>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
