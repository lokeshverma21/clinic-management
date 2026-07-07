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

export function PatientToolbar() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-3 rounded-lg border border-border/60 shadow-sm">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by patient name or phone..." 
          className="pl-9 bg-background border-border/50 h-9 text-sm"
        />
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Show:</span>
          <Select defaultValue="20">
            <SelectTrigger className="w-[70px] h-9 bg-background border-border/50 text-xs">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" size="icon" className="h-9 w-9 border-border/50 text-muted-foreground">
          <RotateCw size={16} />
        </Button>
      </div>
    </div>
  )
}
