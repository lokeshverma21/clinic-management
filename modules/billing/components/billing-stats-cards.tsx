// modules/billing/components/billing-stats-cards.tsx
import * as React from "react"
import { IndianRupee, Clock, FileSpreadsheet, Percent } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
          <Card key={i} className="animate-pulse border-border/50 bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="h-4 w-24 rounded bg-muted"></div>
              <div className="h-4 w-4 rounded-full bg-muted"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 rounded bg-muted mb-2"></div>
              <div className="h-3 w-40 rounded bg-muted"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Revenue */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-emerald-50/10 shadow-sm hover:shadow transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Revenue
          </CardTitle>
          <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600">
            <IndianRupee size={18} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-emerald-700">
            {formatINR(stats.totalRevenue)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Total payments successfully recorded
          </p>
        </CardContent>
      </Card>

      {/* Outstanding Balance */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-amber-50/10 shadow-sm hover:shadow transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Outstanding Payments
          </CardTitle>
          <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-600">
            <Clock size={18} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-amber-600">
            {formatINR(stats.outstandingPayments)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.unpaidCount + stats.partiallyPaidCount} unpaid or partially paid
          </p>
        </CardContent>
      </Card>

      {/* Generated This Month */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-blue-50/10 shadow-sm hover:shadow transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Invoices This Month
          </CardTitle>
          <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-600">
            <FileSpreadsheet size={18} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-blue-700">
            {stats.invoicesGeneratedThisMonth}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Cumulative invoice volume this month
          </p>
        </CardContent>
      </Card>

      {/* Avg Invoice Value & Count */}
      <Card className="border-border/50 shadow-sm hover:shadow transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Invoice Metrics
          </CardTitle>
          <div className="rounded-lg bg-purple-500/10 p-1.5 text-purple-600">
            <Percent size={18} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            {formatINR(stats.averageInvoiceValue)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground flex gap-3">
            <span>Paid: <strong className="text-emerald-600 font-semibold">{stats.paidCount}</strong></span>
            <span>Unpaid: <strong className="text-red-500 font-semibold">{stats.unpaidCount}</strong></span>
            <span>Void/Can: <strong className="text-muted-foreground font-semibold">{stats.cancelledCount}</strong></span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
