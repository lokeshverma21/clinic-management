"use client"

import * as React from "react"
import { Check, Building2, Users } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { AdminPlanListItem } from "../subscriptions.types"

interface PlansTableProps {
  plans: AdminPlanListItem[];
}

export function PlansTable({ plans }: PlansTableProps) {
  if (plans.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 p-8 text-center text-sm text-muted-foreground bg-card">
        No plans configured in the catalog.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-xs">Plan Tier</TableHead>
              <TableHead className="font-semibold text-xs">Monthly Price</TableHead>
              <TableHead className="font-semibold text-xs">Staff Seats</TableHead>
              <TableHead className="font-semibold text-xs">Enrolled Clinics</TableHead>
              <TableHead className="font-semibold text-xs">Included Features</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow
                key={plan.id}
                className="hover:bg-muted/30 transition-colors"
              >
                {/* Plan Tier */}
                <TableCell className="py-4 align-top">
                  <div className="space-y-1">
                    <span className="font-semibold text-sm text-foreground block">
                      {plan.name}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground uppercase">
                      {plan.id}
                    </span>
                  </div>
                </TableCell>

                {/* Price */}
                <TableCell className="py-4 align-top">
                  {plan.amount !== null ? (
                    <div className="font-semibold text-sm text-foreground">
                      ₹{plan.amount.toLocaleString()}
                      <span className="text-xs font-normal text-muted-foreground"> / mo</span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="font-mono text-xs">
                      Custom
                    </Badge>
                  )}
                </TableCell>

                {/* Staff Seat Limit */}
                <TableCell className="py-4 align-top">
                  <div className="flex items-center gap-1.5 text-xs text-foreground font-mono">
                    <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>
                      {plan.staffSeatLimit !== null
                        ? `${plan.staffSeatLimit} seats`
                        : "Unlimited"}
                    </span>
                  </div>
                </TableCell>

                {/* Enrolled Clinics */}
                <TableCell className="py-4 align-top">
                  <Badge variant="secondary" className="font-mono text-xs gap-1.5">
                    <Building2 className="h-3 w-3" />
                    <span>
                      {plan.clinicCount} {plan.clinicCount === 1 ? "clinic" : "clinics"}
                    </span>
                  </Badge>
                </TableCell>

                {/* Feature List */}
                <TableCell className="py-4 align-top">
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
