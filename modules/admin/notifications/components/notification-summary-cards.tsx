"use client";

import * as React from "react";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Mail,
  MessageSquare,
  Smartphone,
  BellRing,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AdminNotificationSummary } from "../notifications.types";

interface NotificationSummaryCardsProps {
  summary: AdminNotificationSummary;
}

export function NotificationSummaryCards({ summary }: NotificationSummaryCardsProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* 4 Main Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Failed in last 24h */}
        <Card className="shadow-none border-border/60">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Failed (Last 24h)</span>
              <AlertCircle className="h-4 w-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary.failedLast24h.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Delivery errors requiring attention
            </div>
          </CardContent>
        </Card>

        {/* Overdue scheduled */}
        <Card className="shadow-none border-border/60">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Overdue Scheduled</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary.overdueScheduledCount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Scheduled &gt;24 hours ago but not sent
            </div>
          </CardContent>
        </Card>

        {/* Sent in last 7 days */}
        <Card className="shadow-none border-border/60">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Sent (Last 7 Days)</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary.last7Days.sent.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span>{summary.last7Days.scheduled} scheduled</span>
              <span>·</span>
              <span>{summary.last7Days.delivered} delivered</span>
            </div>
          </CardContent>
        </Card>

        {/* Skipped for read-only clinics */}
        <Card className="shadow-none border-border/60">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Skipped Read-Only</span>
              <ShieldAlert className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary.readOnlyClinicSkippedLast7Days.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Suspended/canceled clinics in last 7d
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Small row of counts by channel */}
      <div className="flex flex-wrap items-center gap-2 px-3.5 py-2.5 rounded-lg bg-card border border-border/60 shadow-none text-xs text-muted-foreground">
        <span className="font-medium text-foreground mr-1">Activity by Channel (Last 7d):</span>
        <Badge variant="outline" className="gap-1.5 font-normal py-1 border-border/70">
          <Mail className="h-3 w-3 text-blue-600" />
          <span>Email:</span>
          <span className="font-semibold text-foreground font-mono">
            {summary.countsByChannel.email.toLocaleString()}
          </span>
        </Badge>

        <Badge variant="outline" className="gap-1.5 font-normal py-1 border-border/70">
          <MessageSquare className="h-3 w-3 text-emerald-600" />
          <span>WhatsApp:</span>
          <span className="font-semibold text-foreground font-mono">
            {summary.countsByChannel.whatsapp.toLocaleString()}
          </span>
        </Badge>

        <Badge variant="outline" className="gap-1.5 font-normal py-1 border-border/70">
          <Smartphone className="h-3 w-3 text-amber-600" />
          <span>SMS:</span>
          <span className="font-semibold text-foreground font-mono">
            {summary.countsByChannel.sms.toLocaleString()}
          </span>
        </Badge>

        <Badge variant="outline" className="gap-1.5 font-normal py-1 border-border/70">
          <BellRing className="h-3 w-3 text-indigo-600" />
          <span>Push:</span>
          <span className="font-semibold text-foreground font-mono">
            {summary.countsByChannel.push.toLocaleString()}
          </span>
        </Badge>
      </div>
    </div>
  );
}
