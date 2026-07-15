"use client"

import * as React from "react"
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock,
  type LucideIcon
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { AppointmentWithDetails } from "../appointment.types"

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
}

function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="shadow-none border-border/60 bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-background border border-border/50 text-muted-foreground flex items-center justify-center">
            <Icon size={18} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="text-xl font-bold tracking-tight">{value}</h3>
              {trend && (
                <span className={cn(
                  "text-[10px] font-bold px-1 rounded-sm",
                  trend.isUp ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                )}>
                  {trend.isUp ? "+" : "-"}{trend.value}%
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface AppointmentStatsProps {
  appointments: AppointmentWithDetails[];
}

export function AppointmentStats({ appointments }: AppointmentStatsProps) {
  const total = appointments.length
  const confirmed = appointments.filter(a => a.status === "confirmed").length
  const completed = appointments.filter(a => a.status === "completed").length
  const cancelled = appointments.filter(a => a.status === "canceled").length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Schedule Appointments" 
        value={total} 
        icon={Calendar} 
      />
      <StatCard 
        title="Confirmed" 
        value={confirmed} 
        icon={CheckCircle2} 
      />
      <StatCard 
        title="Completed" 
        value={completed} 
        icon={Clock} 
      />
      <StatCard 
        title="Cancelled" 
        value={cancelled} 
        icon={XCircle} 
      />
    </div>
  )
}
