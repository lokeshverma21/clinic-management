// modules/billing/components/invoice-status-badge.tsx
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type InvoiceStatus =
  | 'draft'
  | 'unpaid'
  | 'partially_paid'
  | 'paid'
  | 'cancelled'
  | 'refunded'
  | 'overdue'
  | 'void';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const statusConfig: Record<
  InvoiceStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  draft: {
    label: "Draft",
    variant: "secondary",
    className: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200",
  },
  unpaid: {
    label: "Unpaid",
    variant: "destructive",
    className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100/80",
  },
  partially_paid: {
    label: "Partially Paid",
    variant: "default",
    className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80",
  },
  paid: {
    label: "Paid",
    variant: "outline",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80",
  },
  cancelled: {
    label: "Cancelled",
    variant: "secondary",
    className: "bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200",
  },
  refunded: {
    label: "Refunded",
    variant: "secondary",
    className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/80",
  },
  overdue: {
    label: "Overdue",
    variant: "destructive",
    className: "bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200",
  },
  void: {
    label: "Void",
    variant: "outline",
    className: "bg-neutral-100 text-neutral-400 border-neutral-200 hover:bg-neutral-200",
  },
};

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge
      variant={config.variant}
      className={cn("font-medium transition-colors px-2 py-0.5 border text-xs", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
