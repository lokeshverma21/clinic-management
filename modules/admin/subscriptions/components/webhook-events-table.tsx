"use client"

import * as React from "react"
import Link from "next/link"
import { getIstParts } from "@/lib/time"
import {
  ChevronLeft,
  ChevronRight,
  Radio,
  ExternalLink,
  Calendar,
  Key,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { WebhookEventListItem } from "../subscriptions.types"

interface WebhookEventsTableProps {
  events: WebhookEventListItem[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export function WebhookEventsTable({
  events,
  total,
  page,
  pageSize,
  onPageChange,
}: WebhookEventsTableProps) {
  const startRange = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRange = Math.min(page * pageSize, total);
  const totalPages = Math.ceil(total / pageSize) || 1;

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 p-8 text-center text-sm text-muted-foreground bg-card">
        No webhook events recorded yet. Incoming Cashfree events will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-xs">Event Type</TableHead>
              <TableHead className="font-semibold text-xs">Status</TableHead>
              <TableHead className="font-semibold text-xs">Clinic</TableHead>
              <TableHead className="font-semibold text-xs">Gateway Sub ID</TableHead>
              <TableHead className="font-semibold text-xs">Event Hash</TableHead>
              <TableHead className="text-right font-semibold text-xs">Processed At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((ev) => (
              <TableRow
                key={ev.id}
                className="hover:bg-muted/30 transition-colors"
              >
                {/* Event Type */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-foreground">
                    <Radio className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{ev.eventType}</span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-3">
                  {ev.status === "processed" ? (
                    <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600/90 text-white font-mono text-[10px] capitalize">
                      processed
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="font-mono text-[10px] capitalize text-muted-foreground">
                      {ev.status}
                    </Badge>
                  )}
                </TableCell>

                {/* Clinic Link when known */}
                <TableCell className="py-3 text-xs">
                  {ev.clinicId && ev.clinicName ? (
                    <Link
                      href={`/admin/clinics/${ev.clinicId}`}
                      className="font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 hover:underline"
                    >
                      <span>{ev.clinicName}</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </Link>
                  ) : (
                    <span className="text-muted-foreground/60 italic">—</span>
                  )}
                </TableCell>

                {/* Gateway Subscription ID */}
                <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                  {ev.gatewaySubscriptionId ? (
                    <span className="flex items-center gap-1 truncate max-w-[160px]" title={ev.gatewaySubscriptionId}>
                      <Key className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                      {ev.gatewaySubscriptionId}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/60">—</span>
                  )}
                </TableCell>

                {/* Event Hash */}
                <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                  <span className="truncate max-w-[120px] block" title={ev.eventId}>
                    {ev.eventId.slice(0, 12)}...
                  </span>
                </TableCell>

                {/* Processed At */}
                <TableCell className="py-3 text-right font-mono text-xs text-muted-foreground">
                  <div className="flex items-center justify-end gap-1.5">
                    <Calendar className="h-3 w-3 text-muted-foreground/60" />
                    <span>
                      {(() => {
                        const p = getIstParts(ev.processedAt);
                        return `${p.shortMonth} ${p.day}, ${p.year} ${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}:${String(p.second).padStart(2, "0")}`;
                      })()}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div>
          Showing <span className="font-medium text-foreground">{startRange}</span> to{" "}
          <span className="font-medium text-foreground">{endRange}</span> of{" "}
          <span className="font-medium text-foreground">{total}</span> webhook events
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-8 text-xs gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>

          <span className="text-xs font-mono px-1">
            {page} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-8 text-xs gap-1"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
