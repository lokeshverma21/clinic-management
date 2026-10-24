"use client";

import * as React from "react";
import Link from "next/link";
import { formatIstDateTime } from "@/lib/time";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  ExternalLink,
  Mail,
  MessageSquare,
  Smartphone,
  BellRing,
  AlertCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationStatusBadge } from "./notification-status-badge";
import type {
  AdminNotificationListItem,
  NotificationChannel,
  NotificationType,
} from "../notifications.types";

interface NotificationsTableProps {
  notifications: AdminNotificationListItem[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

function formatTypeLabel(type: NotificationType): string {
  switch (type) {
    case "confirmation":
      return "Confirmation";
    case "reminder_1h":
      return "1-Hour Reminder";
    case "reminder_24h":
      return "24-Hour Reminder";
    case "cancellation":
      return "Cancellation";
    default:
      return type;
  }
}

function ChannelIcon({ channel }: { channel: NotificationChannel }) {
  switch (channel) {
    case "email":
      return <Mail className="h-3.5 w-3.5 text-blue-600" />;
    case "whatsapp":
      return <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />;
    case "sms":
      return <Smartphone className="h-3.5 w-3.5 text-amber-600" />;
    case "push":
      return <BellRing className="h-3.5 w-3.5 text-indigo-600" />;
    default:
      return null;
  }
}

export function NotificationsTable({
  notifications,
  total,
  page,
  pageSize,
  onPageChange,
}: NotificationsTableProps) {
  const startRange = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRange = Math.min(page * pageSize, total);
  const totalPages = Math.ceil(total / pageSize) || 1;

  if (notifications.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 p-8 text-center text-sm text-muted-foreground bg-card">
        No notifications found matching the selected filter criteria.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-xs">Type</TableHead>
              <TableHead className="font-semibold text-xs">Clinic</TableHead>
              <TableHead className="font-semibold text-xs">Status</TableHead>
              <TableHead className="font-semibold text-xs">Channel</TableHead>
              <TableHead className="font-semibold text-xs">Scheduled For</TableHead>
              <TableHead className="font-semibold text-xs">Sent At</TableHead>
              <TableHead className="font-semibold text-xs max-w-[260px]">Failure Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-muted/30 transition-colors group"
              >
                {/* Type */}
                <TableCell className="py-3 font-medium text-xs text-foreground">
                  <Badge variant="outline" className="font-normal font-sans text-xs">
                    {formatTypeLabel(row.type)}
                  </Badge>
                </TableCell>

                {/* Clinic */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <Link
                      href={`/admin/clinics/${row.clinicId}`}
                      className="font-medium text-xs text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group-hover:underline truncate max-w-[180px]"
                      title={row.clinicName}
                    >
                      <span>{row.clinicName}</span>
                      <ExternalLink className="h-3 w-3 opacity-60 shrink-0" />
                    </Link>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-3">
                  <NotificationStatusBadge
                    status={row.status}
                    isOverdue={row.isOverdue}
                  />
                </TableCell>

                {/* Channel */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
                    <ChannelIcon channel={row.channel} />
                    <span>{row.channel}</span>
                  </div>
                </TableCell>

                {/* Scheduled For */}
                <TableCell className="py-3 text-xs text-muted-foreground font-mono">
                  {formatIstDateTime(row.scheduledFor, "minute")}
                </TableCell>

                {/* Sent At */}
                <TableCell className="py-3 text-xs text-muted-foreground font-mono">
                  {row.sentAt ? (
                    formatIstDateTime(row.sentAt, "minute")
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </TableCell>

                {/* Failure Reason */}
                <TableCell className="py-3 text-xs max-w-[260px]">
                  {row.failureReason ? (
                    <div
                      className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-mono text-[11px] truncate cursor-help"
                      title={row.failureReason}
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{row.failureReason}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/40 font-mono text-[11px]">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-1 text-xs text-muted-foreground">
        <div>
          Showing <span className="font-medium text-foreground">{startRange}</span> to{" "}
          <span className="font-medium text-foreground">{endRange}</span> of{" "}
          <span className="font-medium text-foreground">{total}</span> notifications
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-8 gap-1 text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <div className="text-xs font-mono px-2">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-8 gap-1 text-xs"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
