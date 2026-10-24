// modules/staff/components/staff-view-dialog.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import {
  ExternalLink,
  Calendar,
  Briefcase,
  Mail,
  Phone,
  Clock,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { StaffAvatar } from "./staff-avatar"
import { StatusBadge } from "@/components/dashboard/dashboard-status-badge"
import { DashboardDetailRow } from "@/components/dashboard/dashboard-detail-row"
import { parse24To12 } from "@/components/dashboard/dashboard-time-picker"
import { formatIstDate } from "@/lib/time"
import { cn } from "@/lib/utils"
import type { StaffListItem } from "../staff.types"

interface StaffViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: StaffListItem | null
  isSelf?: boolean
}

const DAYS = [
  { key: "mon", label: "Mon", full: "Monday" },
  { key: "tue", label: "Tue", full: "Tuesday" },
  { key: "wed", label: "Wed", full: "Wednesday" },
  { key: "thu", label: "Thu", full: "Thursday" },
  { key: "fri", label: "Fri", full: "Friday" },
  { key: "sat", label: "Sat", full: "Saturday" },
  { key: "sun", label: "Sun", full: "Sunday" },
]

function formatTimeRange(range: string): string {
  const [start, end] = range.split("-")
  if (!start || !end) return range

  const pStart = parse24To12(start)
  const pEnd = parse24To12(end)

  const formatPart = (p: typeof pStart) => `${p.hour12}:${p.minute} ${p.period}`
  return `${formatPart(pStart)} to ${formatPart(pEnd)}`
}

export function StaffViewDialog({
  open,
  onOpenChange,
  staff,
  isSelf = false,
}: StaffViewDialogProps) {
  if (!staff) return null

  const name = staff.user?.fullName ?? "Pending Invite"
  const email = staff.user?.email ?? staff.invitedEmail ?? "—"
  const phone = staff.user?.phone ?? "—"
  const specialization = staff.staffProfile?.specialization || "None specified"
  const colorTag = staff.staffProfile?.colorTag
  const workingHours = staff.staffProfile?.workingHours

  const joinedText = staff.joinedAt
    ? formatIstDate(staff.joinedAt, "d MMM yyyy")
    : "Invitation pending"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border/60 rounded-xl shadow-lg flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-3">
            <StaffAvatar name={name} className="size-11 text-sm border-border/60" />
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl font-semibold tracking-tight truncate">
                  {name}
                </DialogTitle>
                <StatusBadge type="role" status={staff.role} />
                <StatusBadge type="membershipStatus" status={staff.status} />
                {isSelf && (
                  <Badge variant="outline" className="text-[11px] bg-primary/10 text-primary border-primary/20 font-semibold px-2">
                    You
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-xs text-muted-foreground truncate">
                {email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="p-6 space-y-6">
            {/* Overview Section */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Profile Overview
              </span>
              <div className="space-y-2">
                <DashboardDetailRow label="Full Name" value={name} />
                <DashboardDetailRow label="Email" value={email} icon={Mail} />
                <DashboardDetailRow label="Phone" value={phone} icon={Phone} />
                <DashboardDetailRow label="Specialization" value={specialization} icon={Briefcase} />
                <DashboardDetailRow label="Joined Date" value={joinedText} icon={Calendar} />
                {colorTag && (
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-muted-foreground font-medium">Color Badge</span>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-4 rounded-full border border-border/60 shrink-0"
                        style={{ backgroundColor: colorTag }}
                        aria-hidden="true"
                      />
                      <span className="text-foreground">{colorTag}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Weekly Working Hours */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Working Hours
                </span>
                <Clock className="size-3.5 text-muted-foreground" />
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 overflow-hidden divide-y divide-border/40 text-xs">
                {DAYS.map((day) => {
                  const ranges = workingHours?.[day.key as keyof typeof workingHours]
                  const isOpen = Array.isArray(ranges) && ranges.length > 0

                  return (
                    <div
                      key={day.key}
                      className="p-2.5 px-3 flex items-center justify-between gap-2"
                    >
                      <span className="font-medium text-foreground w-12">
                        {day.label}
                      </span>
                      <div className="text-right flex-1 truncate">
                        {isOpen ? (
                          <span className="text-foreground tabular-nums">
                            {ranges.map(formatTimeRange).join(", ")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Closed</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-muted/30 p-4 border-t border-border/40 flex items-center justify-between gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9 text-xs"
          >
            Close
          </Button>

          <Link
            href={`/staff/${staff.membershipId}`}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "gap-1.5 h-9 text-xs"
            )}
            onClick={() => onOpenChange(false)}
          >
            <span>View full profile</span>
            <ExternalLink className="size-3.5" />
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
