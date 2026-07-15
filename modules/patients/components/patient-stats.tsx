"use client"

import * as React from "react"
import { 
  Users, 
  UserPlus, 
  History, 
  Archive,
  type LucideIcon
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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

interface PatientStatsProps {
  total: number;
}

export function PatientStats({ total }: PatientStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Total Patients" 
        value={total} 
        icon={Users} 
      />
      <StatCard 
        title="New This Month" 
        value="1" 
        icon={UserPlus} 
      />
      <StatCard 
        title="Recent Visits" 
        value="0" 
        icon={History} 
      />
      <StatCard 
        title="Archived Patients" 
        value="0" 
        icon={Archive} 
      />
    </div>
  )
}
