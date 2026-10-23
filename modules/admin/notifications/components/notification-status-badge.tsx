"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import type { NotificationStatus } from "../notifications.types";

interface NotificationStatusBadgeProps {
  status: NotificationStatus;
  isOverdue?: boolean;
}

export function NotificationStatusBadge({ status, isOverdue }: NotificationStatusBadgeProps) {
  let badge: React.ReactNode;

  switch (status) {
    case "delivered":
      badge = (
        <Badge
          variant="default"
          className="bg-emerald-600 hover:bg-emerald-600/90 text-white font-mono text-[11px] capitalize"
        >
          delivered
        </Badge>
      );
      break;
    case "sent":
      badge = (
        <Badge
          variant="secondary"
          className="bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30 font-mono text-[11px] capitalize"
        >
          sent
        </Badge>
      );
      break;
    case "scheduled":
      badge = (
        <Badge
          variant="secondary"
          className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-mono text-[11px] capitalize"
        >
          scheduled
        </Badge>
      );
      break;
    case "failed":
      badge = (
        <Badge
          variant="destructive"
          className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-mono text-[11px] capitalize"
        >
          failed
        </Badge>
      );
      break;
    default:
      badge = (
        <Badge variant="outline" className="font-mono text-[11px] capitalize">
          {status}
        </Badge>
      );
  }

  if (isOverdue && status === "scheduled") {
    return (
      <div className="flex items-center gap-1.5">
        {badge}
        <Badge
          variant="outline"
          className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-mono text-[10px] font-semibold uppercase tracking-wider"
        >
          Overdue
        </Badge>
      </div>
    );
  }

  return badge;
}
