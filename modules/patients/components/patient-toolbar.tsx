"use client"

import * as React from "react"
import { Search, RotateCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PatientToolbarProps {
  searchQuery: string
  onSearchChange: (search: string) => void
  pageSize: number
  onPageSizeChange: (pageSize: number) => void
  onRefresh: () => void
}

export function PatientToolbar({
  searchQuery,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  onRefresh,
}: PatientToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card p-3 rounded-lg border border-border/60 shadow-xs transition-colors">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input 
          placeholder="Search by name or phone..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-background border-border/60 h-9 text-sm focus-visible:ring-1"
        />
      </div>
      
      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Show:</span>
          <Select value={String(pageSize)} onValueChange={(val) => onPageSizeChange(Number(val))}>
            <SelectTrigger className="w-[76px] h-9 bg-background border-border/60 text-xs tabular-nums">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10" className="tabular-nums">10</SelectItem>
              <SelectItem value="20" className="tabular-nums">20</SelectItem>
              <SelectItem value="50" className="tabular-nums">50</SelectItem>
              <SelectItem value="100" className="tabular-nums">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onRefresh}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label="Refresh patients"
          title="Refresh patients"
        >
          <RotateCw className="size-4" />
        </Button>
      </div>
    </div>
  )
}
