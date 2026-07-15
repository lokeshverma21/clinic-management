"use client"

import * as React from "react"
import { 
  Search, 
  Calendar as CalendarIcon, 
  User, 
  Filter,
  RotateCcw 
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
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { StaffListItem } from "@/modules/staff"

interface AppointmentToolbarProps {
  searchQuery: string;
  onSearchChange: (search: string) => void;
  doctorId: string;
  onDoctorIdChange: (doctorId: string) => void;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  status: string;
  onStatusChange: (status: string) => void;
  onReset: () => void;
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
          setDoctors(list.filter(d => d.role === "doctor" && d.status === "active"))
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
    <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between bg-card p-3 rounded-lg border border-border/60 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patient name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 bg-background focus-visible:ring-primary/20"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={doctorId} onValueChange={(val) => onDoctorIdChange(val ?? "all")}>
            <SelectTrigger className="h-9 w-full sm:w-[160px] bg-background">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder={isLoading ? "Loading..." : "All Doctors"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {doctors.map((doc) => (
                <SelectItem key={doc.membershipId} value={doc.membershipId}>
                  {doc.user ? doc.user.fullName : doc.invitedEmail}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 w-full sm:w-[160px] justify-start text-left font-normal bg-background text-sm",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
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

          <Select value={status} onValueChange={(val) => onStatusChange(val ?? "all")}>
            <SelectTrigger className="h-9 w-full sm:w-[140px] bg-background">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Status</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9 shrink-0 ml-auto"
        onClick={onReset}
        title="Reset Filters"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  )
}
