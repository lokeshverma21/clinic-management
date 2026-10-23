"use client"

import * as React from "react"
import { Users, UserPlus, Calendar, Clock } from "lucide-react"
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card"

interface PatientStatsProps {
  total: number
}

export function PatientStats({ total }: PatientStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardStatCard 
        title="Total patients" 
        value={total} 
        icon={Users} 
      />
      <DashboardStatCard 
        title="Active directory" 
        value={total} 
        icon={UserPlus} 
      />
      <DashboardStatCard 
        title="Recent visits" 
        value="—" 
        icon={Calendar} 
      />
      <DashboardStatCard 
        title="Follow-ups" 
        value="—" 
        icon={Clock} 
      />
    </div>
  )
}
