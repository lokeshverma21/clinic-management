"use client"

import * as React from "react"
import {
  Search,
  Calendar as CalendarIcon,
  User,
  Filter,
  RotateCcw,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { formatIstDate } from "@/lib/time/ist"
import { cn } from "@/lib/utils"
import type { StaffListItem } from "@/modules/staff"

interface AppointmentToolbarProps {
  searchQuery: string
  onSearchChange: (search: string) => void
  doctorId: string
  onDoctorIdChange: (doctorId: string) => void
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  status: string
  onStatusChange: (status: string) => void
  onReset: () => void
}

export function AppointmentToolbar({
  searchQuery,
  onSearchChange,
  doctorId,
  onDoctorIdChange,
  date,
  onDateChange,
  status,
  onStatusChange,
  onReset,
}: AppointmentToolbarProps) {
  const [doctors, setDoctors] = React.useState<StaffListItem[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    async function loadDoctors() {
      try {
        setIsLoading(true)
        const res = await fetch("/api/staff")
        const json = await res.json()
        if (res.ok && json.data?.staff) {
          const list = json.data.staff as StaffListItem[]
          setDoctors(list.filter((d) => d.role === "doctor" && d.status === "active"))
        }
      } catch (err) {
        console.error("Failed to load doctors", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadDoctors()
  }, [])

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between bg-card p-3 rounded-lg border border-border/60 shadow-xs transition-colors">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search patient or phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 bg-background text-sm border-border/60 focus-visible:ring-1"
          />
        </div>

        {/* Doctor select */}
        <Select
          value={doctorId}
          onValueChange={(val) => onDoctorIdChange(val ?? "all")}
        >
          <SelectTrigger className="h-9 w-full sm:w-44 bg-background border-border/60 text-sm">
            <User className="mr-2 size-4 text-muted-foreground shrink-0" />
            <SelectValue placeholder={isLoading ? "Loading..." : "All doctors"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All doctors</SelectItem>
            {doctors.map((doc) => (
              <SelectItem key={doc.membershipId} value={doc.membershipId}>
                {doc.user ? doc.user.fullName : doc.invitedEmail}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date picker */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className={cn(
                  "h-9 w-full sm:w-44 justify-start text-left font-normal bg-background border-border/60 text-sm",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 size-4 text-muted-foreground shrink-0" />
                <span className="truncate tabular-nums">
                  {date ? formatIstDate(date, "EEE, d MMM yyyy") : "Pick a date"}
                </span>
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
            />
          </PopoverContent>
        </Popover>

        {/* Status filter */}
        <Select
          value={status}
          onValueChange={(val) => onStatusChange(val ?? "all")}
        >
          <SelectTrigger className="h-9 w-full sm:w-36 bg-background border-border/60 text-sm">
            <Filter className="mr-2 size-4 text-muted-foreground shrink-0" />
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
            <SelectItem value="no_show">No show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset action */}
      <div className="flex items-center justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={onReset}
          aria-label="Reset filters"
          title="Reset filters"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
    </div>
  )
}
