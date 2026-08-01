// modules/billing/components/billing-toolbar.tsx
"use client"

import * as React from "react"
import { Search, Calendar as CalendarIcon, User, Filter, CreditCard, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { StaffListItem } from "@/modules/staff"

interface BillingToolbarProps {
  searchQuery: string;
  onSearchChange: (search: string) => void;
  doctorId: string;
  onDoctorIdChange: (doctorId: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  dateFrom: Date | undefined;
  onDateFromChange: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  onDateToChange: (date: Date | undefined) => void;
  onReset: () => void;
}

export function BillingToolbar({
  searchQuery,
  onSearchChange,
  doctorId,
  onDoctorIdChange,
  status,
  onStatusChange,
  paymentMethod,
  onPaymentMethodChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onReset,
}: BillingToolbarProps) {
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
          setDoctors(list.filter(d => (d.role === "doctor" || d.role === "owner") && d.status === "active"))
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
    <div className="flex flex-col gap-3 bg-card p-4 rounded-xl border border-border/50 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice #, patient, phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 bg-background focus-visible:ring-primary/20 text-xs"
          />
        </div>

        {/* Doctor Select */}
        <Select value={doctorId} onValueChange={(val) => onDoctorIdChange(val ?? "all")}>
          <SelectTrigger className="h-9 w-full bg-background text-xs">
            <div className="flex items-center">
              <User className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder={isLoading ? "Loading..." : "All Doctors"} />
            </div>
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

        {/* Status Select */}
        <Select value={status} onValueChange={(val) => onStatusChange(val ?? "all")}>
          <SelectTrigger className="h-9 w-full bg-background text-xs">
            <div className="flex items-center">
              <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="All Statuses" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="partially_paid">Partially Paid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="void">Void</SelectItem>
          </SelectContent>
        </Select>

        {/* Payment Method Select */}
        <Select value={paymentMethod} onValueChange={(val) => onPaymentMethodChange(val ?? "all")}>
          <SelectTrigger className="h-9 w-full bg-background text-xs">
            <div className="flex items-center">
              <CreditCard className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Payment Method" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="Card">Card</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            <SelectItem value="Insurance">Insurance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/30">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Start Date */}
          <Popover>
            <PopoverTrigger>
              <Button
                variant="outline"
                className={cn(
                  "h-9 w-full sm:w-[150px] justify-start text-left font-normal bg-background text-xs",
                  !dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                {dateFrom ? format(dateFrom, "yyyy-MM-dd") : <span>Start Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={onDateFromChange}
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground text-xs hidden sm:inline">to</span>

          {/* End Date */}
          <Popover>
            <PopoverTrigger>
              <Button
                variant="outline"
                className={cn(
                  "h-9 w-full sm:w-[150px] justify-start text-left font-normal bg-background text-xs",
                  !dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                {dateTo ? format(dateTo, "yyyy-MM-dd") : <span>End Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={onDateToChange}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0 w-full sm:w-auto sm:ml-auto"
          onClick={onReset}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear Filters
        </Button>
      </div>
    </div>
  )
}
