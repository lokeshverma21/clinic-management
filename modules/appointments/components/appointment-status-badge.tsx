import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type AppointmentStatus = 'booked' | 'confirmed' | 'completed' | 'canceled' | 'no_show';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

const statusConfig: Record<AppointmentStatus, { label: string, variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
  booked: {
    label: "Booked",
    variant: "secondary",
    className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  },
  confirmed: {
    label: "Confirmed",
    variant: "default",
    className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
  },
  completed: {
    label: "Completed",
    variant: "outline",
    className: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
  },
  canceled: {
    label: "Cancelled",
    variant: "destructive",
    className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
  },
  no_show: {
    label: "No Show",
    variant: "destructive",
    className: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
  },
};

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.booked;

  return (
    <Badge 
      variant={config.variant} 
      className={cn("font-medium transition-colors px-2 py-0.5", config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
