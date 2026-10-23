"use client"

import * as React from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  ArrowUpRight,
  ExternalLink,
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
import { ClinicStatusBadge } from "@/modules/admin/clinics/components/clinic-status-badge"
import { SubscriptionStatusBadge } from "./subscription-status-badge"
import { SubscriptionPlanBadge } from "./subscription-plan-badge"
import type { AdminSubscriptionListItem } from "../subscriptions.types"

interface SubscriptionsTableProps {
  subscriptions: AdminSubscriptionListItem[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export function SubscriptionsTable({
  subscriptions,
  total,
  page,
  pageSize,
  onPageChange,
}: SubscriptionsTableProps) {
  const startRange = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRange = Math.min(page * pageSize, total);
  const totalPages = Math.ceil(total / pageSize) || 1;

  if (subscriptions.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 p-8 text-center text-sm text-muted-foreground bg-card">
        No subscriptions found matching the selected filter criteria.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-xs">Clinic</TableHead>
              <TableHead className="font-semibold text-xs">Clinic Status</TableHead>
              <TableHead className="font-semibold text-xs">Plan</TableHead>
              <TableHead className="font-semibold text-xs">Subscription</TableHead>
              <TableHead className="font-semibold text-xs">Billing Cadence</TableHead>
              <TableHead className="font-semibold text-xs">Period End</TableHead>
              <TableHead className="font-semibold text-xs">Created</TableHead>
              <TableHead className="text-right font-semibold text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow
                key={sub.id}
                className="hover:bg-muted/30 transition-colors group"
              >
                {/* Clinic Info */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <Link
                        href={`/admin/clinics/${sub.clinicId}`}
                        className="font-medium text-xs text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group-hover:underline"
                      >
                        {sub.clinicName}
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </Link>
                    </div>
                  </div>
                </TableCell>

                {/* Clinic Status */}
                <TableCell className="py-3">
                  <ClinicStatusBadge status={sub.clinicStatus} />
                </TableCell>

                {/* Plan Tier */}
                <TableCell className="py-3">
                  <SubscriptionPlanBadge plan={sub.plan} />
                </TableCell>

                {/* Subscription Status */}
                <TableCell className="py-3">
                  <SubscriptionStatusBadge status={sub.status} />
                </TableCell>

                {/* Billing Cadence */}
                <TableCell className="py-3 font-mono text-xs capitalize text-muted-foreground">
                  {sub.billingCycle}
                </TableCell>

                {/* Current Period End */}
                <TableCell className="py-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span>{format(new Date(sub.currentPeriodEnd), "MMM d, yyyy")}</span>
                  </div>
                </TableCell>

                {/* Created Date */}
                <TableCell className="py-3 text-xs text-muted-foreground font-mono">
                  {format(new Date(sub.createdAt), "MMM d, yyyy")}
                </TableCell>

                {/* Actions */}
                <TableCell className="py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                    render={<Link href={`/admin/subscriptions/${sub.clinicId}`} />}
                  >
                    <span>View</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
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
          <span className="font-medium text-foreground">{total}</span> subscriptions
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
