// modules/billing/components/billing-stats-cards.tsx
import * as React from "react"
import { IndianRupee, Clock, FileSpreadsheet, Percent } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card"
import type { InvoiceStats } from "../billing.types"

interface BillingStatsCardsProps {
  stats: InvoiceStats | null
  loading?: boolean
}

function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function BillingStatsCards({ stats, loading }: BillingStatsCardsProps) {
  if (loading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border/60 bg-card shadow-xs">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="size-8 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Revenue */}
      <DashboardStatCard
        title="Total Revenue"
        value={formatINR(stats.totalRevenue)}
        description="Total payments recorded"
        icon={IndianRupee}
      />

      {/* Outstanding Balance */}
      <DashboardStatCard
        title="Outstanding Payments"
        value={formatINR(stats.outstandingPayments)}
        description={`${stats.unpaidCount + stats.partiallyPaidCount} unpaid or partial`}
        icon={Clock}
      />

      {/* Invoices Generated This Month */}
      <DashboardStatCard
        title="Invoices This Month"
        value={stats.invoicesGeneratedThisMonth}
        description="Volume generated this month"
        icon={FileSpreadsheet}
      />

      {/* Average Invoice Value */}
      <DashboardStatCard
        title="Avg. Invoice Value"
        value={formatINR(stats.averageInvoiceValue)}
        description={`${stats.paidCount} paid, ${stats.unpaidCount} unpaid`}
        icon={Percent}
      />
    </div>
  )
}
