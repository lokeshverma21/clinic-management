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
  searchQuery: string;
  onSearchChange: (search: string) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  onRefresh: () => void;
}

export function PatientToolbar({
  searchQuery,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  onRefresh,
}: PatientToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-3 rounded-lg border border-border/60 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by patient name or phone..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-background border-border/50 h-9 text-sm"
        />
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Show:</span>
          <Select value={String(pageSize)} onValueChange={(val) => onPageSizeChange(Number(val))}>
            <SelectTrigger className="w-[70px] h-9 bg-background border-border/50 text-xs">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onRefresh}
          className="h-9 w-9 border-border/50 text-muted-foreground"
          title="Refresh Patients"
        >
          <RotateCw size={16} />
        </Button>
      </div>
    </div>
  )
}
