import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type AppointmentStatusValue =
  | "booked"
  | "confirmed"
  | "completed"
  | "canceled"
  | "no_show"

export type InvoiceStatusValue =
  | "draft"
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "cancelled"
  | "refunded"
  | "overdue"
  | "void"

export type MembershipRoleValue = "owner" | "doctor" | "receptionist"

export type MembershipStatusValue = "active" | "invited" | "deactivated"

export type ClinicStatusValue =
  | "trial"
  | "active"
  | "past_due"
  | "suspended"
  | "canceled"

export type KnownStatusValue =
  | AppointmentStatusValue
  | InvoiceStatusValue
  | MembershipRoleValue
  | MembershipStatusValue
  | ClinicStatusValue
  | string

export interface StatusConfig {
  label: string
  className: string
}

export const APPOINTMENT_STATUS_MAP: Record<AppointmentStatusValue, StatusConfig> = {
  booked: {
    label: "Booked",
    className: "bg-info/10 text-info border-info/20",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-success/10 text-success border-success/20",
  },
  completed: {
    label: "Completed",
    className: "bg-muted text-muted-foreground border-border",
  },
  canceled: {
    label: "Canceled",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  no_show: {
    label: "No show",
    className: "bg-warning/10 text-warning border-warning/20",
  },
}

export const INVOICE_STATUS_MAP: Record<InvoiceStatusValue, StatusConfig> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
  },
  unpaid: {
    label: "Unpaid",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  partially_paid: {
    label: "Partially paid",
    className: "bg-info/10 text-info border-info/20",
  },
  paid: {
    label: "Paid",
    className: "bg-success/10 text-success border-success/20",
  },
  cancelled: {
    label: "Canceled",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  refunded: {
    label: "Refunded",
    className: "bg-muted text-muted-foreground border-border",
  },
  overdue: {
    label: "Past due",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  void: {
    label: "Void",
    className: "bg-muted text-muted-foreground border-border",
  },
}

export const MEMBERSHIP_ROLE_MAP: Record<MembershipRoleValue, StatusConfig> = {
  owner: {
    label: "Owner",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  doctor: {
    label: "Doctor",
    className: "bg-info/10 text-info border-info/20",
  },
  receptionist: {
    label: "Receptionist",
    className: "bg-secondary text-secondary-foreground border-border",
  },
}

export const MEMBERSHIP_STATUS_MAP: Record<MembershipStatusValue, StatusConfig> = {
  active: {
    label: "Active",
    className: "bg-success/10 text-success border-success/20",
  },
  invited: {
    label: "Invited",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  deactivated: {
    label: "Deactivated",
    className: "bg-muted text-muted-foreground border-border",
  },
}

export const CLINIC_STATUS_MAP: Record<ClinicStatusValue, StatusConfig> = {
  trial: {
    label: "Trial",
    className: "bg-info/10 text-info border-info/20",
  },
  active: {
    label: "Active",
    className: "bg-success/10 text-success border-success/20",
  },
  past_due: {
    label: "Past due",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  suspended: {
    label: "Suspended",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  canceled: {
    label: "Canceled",
    className: "bg-muted text-muted-foreground border-border",
  },
}

export const SUBSCRIPTION_STATUS_MAP: Record<string, StatusConfig> = {
  trial: {
    label: "Trial",
    className: "bg-info/10 text-info border-info/20",
  },
  trialing: {
    label: "Trial",
    className: "bg-info/10 text-info border-info/20",
  },
  active: {
    label: "Active",
    className: "bg-success/10 text-success border-success/20",
  },
  past_due: {
    label: "Past due",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  paused: {
    label: "Paused",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  suspended: {
    label: "Suspended",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  canceled: {
    label: "Canceled",
    className: "bg-muted text-muted-foreground border-border",
  },
}

function resolveConfig(
  status: KnownStatusValue,
  type?: "appointment" | "invoice" | "role" | "membershipStatus" | "clinic" | "subscription" | "auto"
): StatusConfig {
  const normalized = (status || "").toLowerCase().trim()

  if (type === "appointment" && normalized in APPOINTMENT_STATUS_MAP) {
    return APPOINTMENT_STATUS_MAP[normalized as AppointmentStatusValue]
  }

  if (type === "invoice" && normalized in INVOICE_STATUS_MAP) {
    return INVOICE_STATUS_MAP[normalized as InvoiceStatusValue]
  }

  if (type === "role" && normalized in MEMBERSHIP_ROLE_MAP) {
    return MEMBERSHIP_ROLE_MAP[normalized as MembershipRoleValue]
  }

  if (type === "membershipStatus" && normalized in MEMBERSHIP_STATUS_MAP) {
    return MEMBERSHIP_STATUS_MAP[normalized as MembershipStatusValue]
  }

  if (type === "clinic" && normalized in CLINIC_STATUS_MAP) {
    return CLINIC_STATUS_MAP[normalized as ClinicStatusValue]
  }

  if (type === "subscription" && normalized in SUBSCRIPTION_STATUS_MAP) {
    return SUBSCRIPTION_STATUS_MAP[normalized]
  }

  // Automatic lookup
  if (normalized in APPOINTMENT_STATUS_MAP) {
    return APPOINTMENT_STATUS_MAP[normalized as AppointmentStatusValue]
  }
  if (normalized in INVOICE_STATUS_MAP) {
    return INVOICE_STATUS_MAP[normalized as InvoiceStatusValue]
  }
  if (normalized in MEMBERSHIP_ROLE_MAP) {
    return MEMBERSHIP_ROLE_MAP[normalized as MembershipRoleValue]
  }
  if (normalized in MEMBERSHIP_STATUS_MAP) {
    return MEMBERSHIP_STATUS_MAP[normalized as MembershipStatusValue]
  }
  if (normalized in SUBSCRIPTION_STATUS_MAP) {
    return SUBSCRIPTION_STATUS_MAP[normalized]
  }
  if (normalized in CLINIC_STATUS_MAP) {
    return CLINIC_STATUS_MAP[normalized as ClinicStatusValue]
  }

  // Fallback to formatted sentence-case
  const fallbackLabel = normalized
    ? normalized.charAt(0).toUpperCase() + normalized.slice(1).replace(/_/g, " ")
    : "Unknown"

  return {
    label: fallbackLabel,
    className: "bg-muted text-muted-foreground border-border",
  }
}

export interface DashboardStatusBadgeProps {
  status: KnownStatusValue
  type?: "appointment" | "invoice" | "role" | "membershipStatus" | "clinic" | "subscription" | "auto"
  label?: string
  className?: string
  dot?: boolean
}

export function DashboardStatusBadge({
  status,
  type = "auto",
  label,
  className,
  dot = false,
}: DashboardStatusBadgeProps) {
  const config = resolveConfig(status, type)
  const displayLabel = label ?? config.label

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium border rounded-md transition-colors whitespace-nowrap",
        config.className,
        className
      )}
    >
      {dot && (
        <span
          className="size-1.5 rounded-full bg-current opacity-80 shrink-0"
          aria-hidden="true"
        />
      )}
      <span>{displayLabel}</span>
    </Badge>
  )
}

// Re-export with alias for convenience
export const StatusBadge = DashboardStatusBadge
