// modules/staff/components/staff-table.tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Archive,
  Users,
  ShieldCheck,
  Calendar,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type StaffListItem } from "../staff.types"
import { StaffAvatar } from "./staff-avatar"
import { StatusBadge } from "@/components/dashboard/dashboard-status-badge"
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface StaffTableProps {
  staff: StaffListItem[]
  onViewStaff: (staff: StaffListItem) => void
  onEditStaff: (staff: StaffListItem) => void
  onArchiveStaff: (staff: StaffListItem) => void
  currentMembershipId?: string
  currentRole?: string
}

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
const DAY_LABELS: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
}

function formatWorkingDaysSummary(
  workingHours: Partial<Record<string, string[]>> | null | undefined
): string {
  if (!workingHours) return "—"
  const activeDays = DAY_ORDER.filter(
    (k) => Array.isArray(workingHours[k]) && workingHours[k]!.length > 0
  )

  if (activeDays.length === 0) return "No hours"
  if (activeDays.length === 7) return "Daily"
  if (activeDays.length === 5 && activeDays.every((d, i) => d === ["mon", "tue", "wed", "thu", "fri"][i])) {
    return "Mon–Fri"
  }
  if (activeDays.length <= 3) {
    return activeDays.map((d) => DAY_LABELS[d]).join(", ")
  }
  return `${activeDays.length} days/wk`
}

export function StaffTable({
  staff,
  onViewStaff,
  onEditStaff,
  onArchiveStaff,
  currentMembershipId,
  currentRole,
}: StaffTableProps) {
  const router = useRouter()

  // Count active owners for last-owner protection
  const activeOwnerCount = React.useMemo(() => {
    return staff.filter((s) => s.role === "owner" && s.status === "active").length
  }, [staff])

  if (staff.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 bg-card p-8">
        <DashboardEmptyState
          icon={Users}
          title="No staff members found"
          description="Try adjusting your search query or invite a new staff member."
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 overflow-hidden bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 text-xs font-medium text-muted-foreground pl-5 w-[60px]">
                  Avatar
                </TableHead>
                <TableHead className="h-10 text-xs font-medium text-muted-foreground">
                  Name & Email
                </TableHead>
                <TableHead className="h-10 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                  Role
                </TableHead>
                <TableHead className="h-10 text-xs font-medium text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="h-10 text-xs font-medium text-muted-foreground hidden md:table-cell">
                  Specialization
                </TableHead>
                <TableHead className="h-10 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                  Working Days
                </TableHead>
                <TableHead className="h-10 text-xs font-medium text-muted-foreground hidden xl:table-cell">
                  Joined
                </TableHead>
                <TableHead className="h-10 w-[60px] text-right pr-5"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/40">
              {staff.map((member) => {
                const isDeactivated = member.status === "deactivated"
                const isSelf = currentMembershipId === member.membershipId
                const isLastOwner = member.role === "owner" && member.status === "active" && activeOwnerCount <= 1
                const name = member.user?.fullName ?? "Pending Invite"
                const email = member.user?.email ?? member.invitedEmail ?? "—"
                const specialization = member.staffProfile?.specialization || "—"
                const daysSummary = formatWorkingDaysSummary(member.staffProfile?.workingHours)
                const colorTag = member.staffProfile?.colorTag

                return (
                  <TableRow
                    key={member.membershipId}
                    className={cn(
                      "h-14 transition-colors hover:bg-muted/50 cursor-pointer",
                      isDeactivated && "opacity-60 bg-muted/10 hover:bg-muted/30"
                    )}
                    onClick={() => onViewStaff(member)}
                  >
                    <TableCell className="pl-5 py-3">
                      <div className="relative">
                        <StaffAvatar name={name} className="size-8 text-xs border-border/60" />
                        {colorTag && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border border-background shadow-xs"
                            style={{ backgroundColor: colorTag }}
                            title={`Color badge: ${colorTag}`}
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground hover:underline">
                          {name}
                        </span>
                        {isSelf && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-primary/10 text-primary border-primary/20 px-1.5 py-0 font-semibold"
                          >
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[220px]">
                        {email}
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell py-3">
                      <StatusBadge type="role" status={member.role} />
                    </TableCell>

                    <TableCell className="py-3">
                      <StatusBadge type="membershipStatus" status={member.status} />
                    </TableCell>

                    <TableCell className="hidden md:table-cell py-3 text-xs text-muted-foreground truncate max-w-[160px]">
                      {specialization}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell py-3 text-xs text-muted-foreground">
                      {daysSummary}
                    </TableCell>

                    <TableCell className="hidden xl:table-cell py-3 text-xs text-muted-foreground tabular-nums">
                      {member.joinedAt ? format(new Date(member.joinedAt), "d MMM yyyy") : "Pending"}
                    </TableCell>

                    <TableCell className="pr-5 text-right py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-foreground"
                              aria-label={`Actions for ${name}`}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => onViewStaff(member)} className="gap-2 text-xs">
                            <Eye className="size-3.5 text-muted-foreground" />
                            <span>Quick view</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => router.push(`/staff/${member.membershipId}`)} className="gap-2 text-xs">
                            <Calendar className="size-3.5 text-muted-foreground" />
                            <span>Full details</span>
                          </DropdownMenuItem>

                          {/* Only owners can edit staff */}
                          {(!currentRole || currentRole === "owner") && (
                            <DropdownMenuItem onClick={() => onEditStaff(member)} className="gap-2 text-xs">
                              <Pencil className="size-3.5 text-muted-foreground" />
                              <span>Edit staff</span>
                            </DropdownMenuItem>
                          )}

                          {/* Deactivate staff action with owner self-protection & last active owner protection */}
                          {(!currentRole || currentRole === "owner") && !isDeactivated && (
                            <>
                              <DropdownMenuSeparator />
                              {isSelf ? (
                                <DropdownMenuItem disabled className="gap-2 text-xs text-muted-foreground">
                                  <Archive className="size-3.5" />
                                  <span>Cannot deactivate yourself</span>
                                </DropdownMenuItem>
                              ) : isLastOwner ? (
                                <DropdownMenuItem disabled className="gap-2 text-xs text-muted-foreground">
                                  <ShieldCheck className="size-3.5" />
                                  <span>Cannot deactivate last owner</span>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  className="gap-2 text-xs text-destructive focus:text-destructive"
                                  onClick={() => onArchiveStaff(member)}
                                >
                                  <Archive className="size-3.5" />
                                  <span>Deactivate staff</span>
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground tabular-nums">
          Showing {staff.length} staff member{staff.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  )
}
