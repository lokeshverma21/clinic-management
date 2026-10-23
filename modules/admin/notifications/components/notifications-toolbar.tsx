"use client";

import * as React from "react";
import {
  Filter,
  RotateCcw,
  Clock,
  Calendar as CalendarIcon,
  Radio,
  Tag,
  Building2,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  notificationChannelEnum,
  notificationStatusEnum,
  notificationTypeEnum,
} from "@/db/schema/enums";

interface NotificationsToolbarProps {
  status: string;
  onStatusChange: (status: string) => void;
  channel: string;
  onChannelChange: (channel: string) => void;
  type: string;
  onTypeChange: (type: string) => void;
  onlyOverdue: boolean;
  onOnlyOverdueChange: (onlyOverdue: boolean) => void;
  clinicId: string;
  onClinicIdChange: (clinicId: string) => void;
  from: string;
  onFromChange: (from: string) => void;
  to: string;
  onToChange: (to: string) => void;
  onReset: () => void;
}

export function NotificationsToolbar({
  status,
  onStatusChange,
  channel,
  onChannelChange,
  type,
  onTypeChange,
  onlyOverdue,
  onOnlyOverdueChange,
  clinicId,
  onClinicIdChange,
  from,
  onFromChange,
  to,
  onToChange,
  onReset,
}: NotificationsToolbarProps) {
  const hasActiveFilters = Boolean(
    status || channel || type || onlyOverdue || clinicId || from || to,
  );

  return (
    <div className="flex flex-col gap-3 bg-card p-4 rounded-xl border border-border/50 shadow-sm animate-in fade-in duration-300">
      {/* Removable Clinic Chip if clinicId is present */}
      {clinicId && (
        <div className="flex items-center gap-2 pb-1">
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-primary/10 text-primary border border-primary/20"
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Clinic ID: {clinicId}</span>
            <button
              type="button"
              onClick={() => onClinicIdChange("")}
              className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              title="Clear clinic filter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}

      {/* Main Filter Controls Grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-center">
        {/* Status Select */}
        <div>
          <Select
            value={status || "ALL"}
            onValueChange={(val) => onStatusChange(!val || val === "ALL" ? "" : val)}
          >
            <SelectTrigger className="w-full bg-background border-border/60">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Statuses" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {notificationStatusEnum.enumValues.map((st) => (
                <SelectItem key={st} value={st} className="capitalize">
                  {st}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Channel Select */}
        <div>
          <Select
            value={channel || "ALL"}
            onValueChange={(val) => onChannelChange(!val || val === "ALL" ? "" : val)}
          >
            <SelectTrigger className="w-full bg-background border-border/60">
              <div className="flex items-center gap-2 truncate">
                <Radio className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Channels" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Channels</SelectItem>
              {notificationChannelEnum.enumValues.map((ch) => (
                <SelectItem key={ch} value={ch} className="capitalize">
                  {ch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Select */}
        <div>
          <Select
            value={type || "ALL"}
            onValueChange={(val) => onTypeChange(!val || val === "ALL" ? "" : val)}
          >
            <SelectTrigger className="w-full bg-background border-border/60">
              <div className="flex items-center gap-2 truncate">
                <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Types" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {notificationTypeEnum.enumValues.map((tp) => (
                <SelectItem key={tp} value={tp}>
                  {tp.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Overdue Toggle Button */}
        <div>
          <Button
            type="button"
            variant={onlyOverdue ? "default" : "outline"}
            onClick={() => onOnlyOverdueChange(!onlyOverdue)}
            className={`w-full justify-center gap-2 text-xs font-medium border-border/60 ${
              onlyOverdue
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="h-4 w-4 shrink-0" />
            <span>Only Overdue (&gt;24h)</span>
          </Button>
        </div>
      </div>

      {/* Date Range & Reset Row */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-center pt-1 border-t border-border/30">
        {/* From Date */}
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            placeholder="From date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className="pl-9 bg-background border-border/60 text-xs"
            title="Scheduled from date"
          />
        </div>

        {/* To Date */}
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            placeholder="To date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className="pl-9 bg-background border-border/60 text-xs"
            title="Scheduled to date"
          />
        </div>

        {/* Clinic ID input (if not already set or to allow manual input) */}
        {!clinicId && (
          <div className="relative">
            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter by Clinic ID..."
              value={clinicId}
              onChange={(e) => onClinicIdChange(e.target.value)}
              className="pl-9 bg-background border-border/60 text-xs"
            />
          </div>
        )}

        {/* Reset Filters */}
        <div className={`flex items-center ${clinicId ? "sm:col-span-2" : ""} justify-end`}>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
