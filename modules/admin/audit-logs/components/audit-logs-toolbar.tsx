"use client"

import * as React from "react"
import { Filter, RotateCcw, Building2, Calendar as CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ADMIN_AUDIT_ACTIONS, type AdminAuditAction } from "../audit-logs.types"

interface AuditLogsToolbarProps {
  action: string;
  onActionChange: (action: string) => void;
  clinicId: string;
  onClinicIdChange: (clinicId: string) => void;
  from: string;
  onFromChange: (from: string) => void;
  to: string;
  onToChange: (to: string) => void;
  onReset: () => void;
}

export function AuditLogsToolbar({
  action,
  onActionChange,
  clinicId,
  onClinicIdChange,
  from,
  onFromChange,
  to,
  onToChange,
  onReset,
}: AuditLogsToolbarProps) {
  const hasActiveFilters = Boolean(action || clinicId || from || to);

  return (
    <div className="flex flex-col gap-3 bg-card p-4 rounded-xl border border-border/50 shadow-sm animate-in fade-in duration-300">
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-center">
        {/* Action Select */}
        <div>
          <Select
            value={action || "ALL"}
            onValueChange={(val) => onActionChange(val === "ALL" ? "" : (val as AdminAuditAction))}
          >
            <SelectTrigger className="w-full bg-background border-border/60">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Actions" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Actions</SelectItem>
              {ADMIN_AUDIT_ACTIONS.map((act) => (
                <SelectItem key={act} value={act}>
                  {act}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clinic ID Search */}
        <div className="relative">
          <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by Clinic ID..."
            value={clinicId}
            onChange={(e) => onClinicIdChange(e.target.value)}
            className="pl-9 bg-background border-border/60"
          />
        </div>

        {/* Date From */}
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            placeholder="From date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className="pl-9 bg-background border-border/60"
            title="From date"
          />
        </div>

        {/* Date To */}
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            placeholder="To date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className="pl-9 bg-background border-border/60"
            title="To date"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-foreground h-8 px-2.5"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  )
}
