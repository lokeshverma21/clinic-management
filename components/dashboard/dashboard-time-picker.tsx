"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface DashboardTimePickerProps {
  value: string // Format: "HH:mm" (24-hour)
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  id?: string
  minuteStep?: 5 | 15 | 30
  ariaLabel?: string
}

export function parse24To12(value: string): {
  hour12: string
  minute: string
  period: "AM" | "PM"
} {
  if (!value || !value.includes(":")) {
    return { hour12: "", minute: "", period: "AM" }
  }

  const [hStr, mStr] = value.split(":")
  const h24 = parseInt(hStr, 10)
  const minute = (mStr || "00").slice(0, 2)

  if (isNaN(h24)) {
    return { hour12: "", minute: "", period: "AM" }
  }

  const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM"
  let h12 = h24 % 12
  if (h12 === 0) h12 = 12

  return {
    hour12: String(h12),
    minute,
    period,
  }
}

export function format12To24(
  hour12: string,
  minute: string,
  period: "AM" | "PM"
): string {
  if (!hour12) return ""

  const h = parseInt(hour12, 10)
  if (isNaN(h)) return ""

  let h24 = h % 12
  if (period === "PM") {
    h24 += 12
  }

  const cleanMinute = minute ? minute.padStart(2, "0").slice(0, 2) : "00"
  return `${String(h24).padStart(2, "0")}:${cleanMinute}`
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1))

export function DashboardTimePicker({
  value,
  onChange,
  disabled = false,
  className,
  id,
  minuteStep = 15,
  ariaLabel = "Time picker",
}: DashboardTimePickerProps) {
  const { hour12, minute, period } = React.useMemo(
    () => parse24To12(value),
    [value]
  )

  const minutesList = React.useMemo(() => {
    const list: string[] = []
    for (let m = 0; m < 60; m += minuteStep) {
      list.push(String(m).padStart(2, "0"))
    }
    // If current minute is non-standard, insert it and keep sorted
    if (minute && !list.includes(minute)) {
      list.push(minute)
      list.sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
    }
    return list
  }, [minuteStep, minute])

  const handleHourChange = (newHour: string | null) => {
    if (!newHour) return
    const newMinute = minute || "00"
    const newPeriod = period || "AM"
    const next24 = format12To24(newHour, newMinute, newPeriod)
    onChange(next24)
  }

  const handleMinuteChange = (newMin: string | null) => {
    if (!newMin) return
    const currentHour = hour12 || "9"
    const newPeriod = period || "AM"
    const next24 = format12To24(currentHour, newMin, newPeriod)
    onChange(next24)
  }

  const handlePeriodChange = (newPeriod: string | null) => {
    if (newPeriod !== "AM" && newPeriod !== "PM") return
    const currentHour = hour12 || "9"
    const newMinute = minute || "00"
    const next24 = format12To24(currentHour, newMinute, newPeriod)
    onChange(next24)
  }

  return (
    <div
      id={id}
      role="group"
      aria-label={ariaLabel}
      className={cn("flex items-center gap-1.5 w-full", className)}
    >
      {/* Hour Select */}
      <Select
        value={hour12 || undefined}
        onValueChange={handleHourChange}
        disabled={disabled}
      >
        <SelectTrigger
          aria-label="Hour"
          className="h-10 flex-1 min-w-[64px] bg-background text-sm tabular-nums text-center px-2"
        >
          <SelectValue placeholder="Hr" />
        </SelectTrigger>
        <SelectContent className="max-h-56">
          {HOURS.map((h) => (
            <SelectItem key={h} value={h} className="tabular-nums">
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-muted-foreground font-semibold text-xs select-none">
        :
      </span>

      {/* Minute Select */}
      <Select
        value={minute || undefined}
        onValueChange={handleMinuteChange}
        disabled={disabled}
      >
        <SelectTrigger
          aria-label="Minute"
          className="h-10 flex-1 min-w-[64px] bg-background text-sm tabular-nums text-center px-2"
        >
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent className="max-h-56">
          {minutesList.map((m) => (
            <SelectItem key={m} value={m} className="tabular-nums">
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* AM / PM Select */}
      <Select
        value={period}
        onValueChange={handlePeriodChange}
        disabled={disabled}
      >
        <SelectTrigger
          aria-label="Period AM or PM"
          className="h-10 w-[72px] shrink-0 bg-background text-xs font-semibold uppercase px-2 text-center"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
