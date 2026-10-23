// modules/staff/components/staff-toolbar.tsx
"use client"

import * as React from "react"
import { Search, RotateCw, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface StaffToolbarProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
  roleFilter?: string
  onRoleFilterChange?: (role: string) => void
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function StaffToolbar({
  searchQuery = "",
  onSearchChange,
  roleFilter = "all",
  onRoleFilterChange,
  onRefresh,
  isRefreshing = false,
}: StaffToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border/60 shadow-xs">
      <div className="relative flex-1 min-w-[200px] sm:max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by staff name or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-9 bg-background h-9 text-xs"
          aria-label="Search staff"
        />
      </div>

      <div className="flex items-center gap-2.5">
        {onRoleFilterChange && (
          <Select value={roleFilter} onValueChange={(val) => onRoleFilterChange?.(val ?? "all")}>
            <SelectTrigger className="w-[130px] h-9 bg-background text-xs" aria-label="Filter by role">
              <div className="flex items-center gap-1.5 truncate">
                <Filter className="size-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Roles" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="receptionist">Receptionist</SelectItem>
            </SelectContent>
          </Select>
        )}

        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            className="size-9 bg-background text-muted-foreground hover:text-foreground"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh staff list"
          >
            <RotateCw className={isRefreshing ? "size-3.5 animate-spin" : "size-3.5"} />
          </Button>
        )}
      </div>
    </div>
  )
}
