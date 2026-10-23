"use client"

import * as React from "react"
import { Search, Filter, Layers, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { subscriptionPlanEnum, subscriptionStatusEnum } from "@/db/schema/enums"

interface SubscriptionsToolbarProps {
  searchQuery: string;
  onSearchChange: (search: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  plan: string;
  onPlanChange: (plan: string) => void;
  onReset: () => void;
}

export function SubscriptionsToolbar({
  searchQuery,
  onSearchChange,
  status,
  onStatusChange,
  plan,
  onPlanChange,
  onReset,
}: SubscriptionsToolbarProps) {
  const hasActiveFilters = Boolean(searchQuery.trim() || status || plan);

  return (
    <div className="flex flex-col gap-3 bg-card p-4 rounded-xl border border-border/50 shadow-sm animate-in fade-in duration-300">
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-center">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by clinic name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background border-border/60"
          />
        </div>

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
              {subscriptionStatusEnum.enumValues.map((st) => (
                <SelectItem key={st} value={st} className="capitalize">
                  {st.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Plan Select */}
        <div>
          <Select
            value={plan || "ALL"}
            onValueChange={(val) => onPlanChange(!val || val === "ALL" ? "" : val)}
          >
            <SelectTrigger className="w-full bg-background border-border/60">
              <div className="flex items-center gap-2 truncate">
                <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Plans" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Plans</SelectItem>
              {subscriptionPlanEnum.enumValues.map((pl) => (
                <SelectItem key={pl} value={pl} className="capitalize">
                  {pl === "professional" ? "Growth" : pl}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
