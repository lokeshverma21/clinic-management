"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  Code,
  Building,
  User,
  Shield,
  Clock,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AdminAuditLogWithActor } from "../audit-logs.types"

interface AuditLogsTableProps {
  logs: AdminAuditLogWithActor[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

function getActionBadgeVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
  if (action.includes("suspended") || action.includes("removed")) {
    return "destructive"
  }
  if (action.includes("reactivated") || action.includes("added")) {
    return "default"
  }
  if (action.includes("extended") || action.includes("changed")) {
    return "secondary"
  }
  return "outline"
}

export function AuditLogsTable({
  logs,
  total,
  page,
  pageSize,
  onPageChange,
}: AuditLogsTableProps) {
  const [selectedMetadata, setSelectedMetadata] = React.useState<{
    logId: string;
    action: string;
    data: unknown;
  } | null>(null);

  const startRange = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRange = Math.min(page * pageSize, total);
  const totalPages = Math.ceil(total / pageSize) || 1;

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 p-8 text-center text-sm text-muted-foreground bg-card">
        No audit log events match the current filter criteria.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-3.5 pl-6">Timestamp</TableHead>
              <TableHead className="py-3.5">Action</TableHead>
              <TableHead className="py-3.5">Actor</TableHead>
              <TableHead className="py-3.5">Target</TableHead>
              <TableHead className="py-3.5 hidden md:table-cell">Clinic</TableHead>
              <TableHead className="w-[100px] text-right py-3.5 pr-6">Metadata</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const formattedDate = format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss");
              const hasMetadata =
                log.metadata !== null &&
                typeof log.metadata === "object" &&
                Object.keys(log.metadata).length > 0;

              return (
                <TableRow key={log.id} className="hover:bg-muted/30">
                  {/* Timestamp */}
                  <TableCell className="py-3.5 pl-6 whitespace-nowrap text-xs font-mono text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="py-3.5">
                    <Badge variant={getActionBadgeVariant(log.action)} className="font-mono text-[11px]">
                      {log.action}
                    </Badge>
                  </TableCell>

                  {/* Actor */}
                  <TableCell className="py-3.5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[180px]">{log.actor?.fullName ?? log.actorEmail}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-5">
                        <span className="truncate max-w-[180px]">{log.actorEmail}</span>
                        {log.actor?.role && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-mono uppercase bg-muted px-1.5 py-0.2 rounded">
                            <Shield className="h-2.5 w-2.5" />
                            {log.actor.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Target */}
                  <TableCell className="py-3.5 text-xs">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground capitalize">{log.targetType}</span>
                      {log.targetId ? (
                        <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[160px]" title={log.targetId}>
                          {log.targetId}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Clinic */}
                  <TableCell className="py-3.5 hidden md:table-cell text-xs">
                    {log.clinic?.name ? (
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground truncate max-w-[150px]">
                          {log.clinic.name}
                        </span>
                      </div>
                    ) : log.clinicId ? (
                      <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[140px]" title={log.clinicId}>
                        {log.clinicId}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60 italic text-[11px]">Platform-wide</span>
                    )}
                  </TableCell>

                  {/* Metadata */}
                  <TableCell className="text-right py-3.5 pr-6">
                    {hasMetadata ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() =>
                          setSelectedMetadata({
                            logId: log.id,
                            action: log.action,
                            data: log.metadata,
                          })
                        }
                      >
                        <Code className="h-3.5 w-3.5" />
                        Details
                      </Button>
                    ) : (
                      <span className="text-muted-foreground/50 text-xs">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {startRange}–{endRange} of {total} events
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metadata Detail Dialog */}
      <Dialog
        open={selectedMetadata !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedMetadata(null);
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <span>Event Metadata</span>
              {selectedMetadata && (
                <Badge variant="outline" className="font-mono text-xs">
                  {selectedMetadata.action}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Structured payload recorded alongside this administrative action.
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
    </div>
  );
}
