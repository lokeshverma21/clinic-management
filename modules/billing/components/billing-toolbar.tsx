// modules/billing/components/billing-toolbar.tsx
"use client"

import * as React from "react"
import { Search, Calendar as CalendarIcon, User, Filter, CreditCard, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { getIstParts } from "@/lib/time/ist"
import { cn } from "@/lib/utils"
import type { StaffListItem } from "@/modules/staff"

interface BillingToolbarProps {
  searchQuery: string
  onSearchChange: (search: string) => void
  doctorId: string
  onDoctorIdChange: (doctorId: string) => void
  status: string
  onStatusChange: (status: string) => void
  paymentMethod: string
  onPaymentMethodChange: (method: string) => void
  dateFrom: Date | undefined
  onDateFromChange: (date: Date | undefined) => void
  dateTo: Date | undefined
  onDateToChange: (date: Date | undefined) => void
  onReset: () => void
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

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    doctorId !== "all" ||
    status !== "all" ||
    paymentMethod !== "all" ||
    dateFrom !== undefined ||
    dateTo !== undefined

  return (
    <div className="flex flex-wrap items-center gap-2.5 bg-card p-3 rounded-lg border border-border/60 shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] sm:min-w-[240px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search invoice #, patient, phone..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 bg-background text-xs"
          aria-label="Search invoices"
        />
      </div>

      {/* Doctor Filter */}
      <Select value={doctorId} onValueChange={(val) => onDoctorIdChange(val ?? "all")}>
        <SelectTrigger className="h-9 w-full sm:w-[150px] bg-background text-xs" aria-label="Filter by doctor">
          <div className="flex items-center gap-1.5 truncate">
            <User className="size-3.5 text-muted-foreground shrink-0" />
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

      {/* Status Filter */}
      <Select value={status} onValueChange={(val) => onStatusChange(val ?? "all")}>
        <SelectTrigger className="h-9 w-full sm:w-[130px] bg-background text-xs" aria-label="Filter by status">
          <div className="flex items-center gap-1.5 truncate">
            <Filter className="size-3.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder="All Statuses" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="unpaid">Unpaid</SelectItem>
          <SelectItem value="partially_paid">Partially paid</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="overdue">Past due</SelectItem>
          <SelectItem value="cancelled">Canceled</SelectItem>
          <SelectItem value="refunded">Refunded</SelectItem>
          <SelectItem value="void">Void</SelectItem>
        </SelectContent>
      </Select>

      {/* Payment Method Filter */}
      <Select value={paymentMethod} onValueChange={(val) => onPaymentMethodChange(val ?? "all")}>
        <SelectTrigger className="h-9 w-full sm:w-[140px] bg-background text-xs" aria-label="Filter by payment method">
          <div className="flex items-center gap-1.5 truncate">
            <CreditCard className="size-3.5 text-muted-foreground shrink-0" />
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

      {/* Date Range Popovers */}
      <div className="flex items-center gap-1.5">
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className={cn(
                  "h-9 w-[120px] justify-start text-left font-normal bg-background text-xs px-2.5",
                  !dateFrom && "text-muted-foreground"
                )}
                aria-label="Start date filter"
              >
                <CalendarIcon className="mr-1.5 size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{dateFrom ? (() => { const p = getIstParts(dateFrom); return `${String(p.day).padStart(2, '0')}/${String(p.month).padStart(2, '0')}/${p.year}`; })() : "Start date"}</span>
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={onDateFromChange}
            />
          </PopoverContent>
        </Popover>

        <span className="text-muted-foreground text-xs select-none">—</span>

        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className={cn(
                  "h-9 w-[120px] justify-start text-left font-normal bg-background text-xs px-2.5",
                  !dateTo && "text-muted-foreground"
                )}
                aria-label="End date filter"
              >
                <CalendarIcon className="mr-1.5 size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{dateTo ? (() => { const p = getIstParts(dateTo); return `${String(p.day).padStart(2, '0')}/${String(p.month).padStart(2, '0')}/${p.year}`; })() : "End date"}</span>
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={onDateToChange}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0 ml-auto"
          onClick={onReset}
          aria-label="Reset filters"
        >
          <RotateCcw className="size-3.5" />
          <span>Reset</span>
        </Button>
      )}
    </div>
  )
}
