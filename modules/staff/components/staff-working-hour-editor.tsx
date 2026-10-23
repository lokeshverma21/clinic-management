// modules/staff/components/staff-working-hour-editor.tsx
"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DashboardTimePicker } from "@/components/dashboard/dashboard-time-picker"
import { cn } from "@/lib/utils"
import type { WorkingHours } from "../staff.types"

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: "mon", label: "Monday", short: "Mon" },
  { key: "tue", label: "Tuesday", short: "Tue" },
  { key: "wed", label: "Wednesday", short: "Wed" },
  { key: "thu", label: "Thursday", short: "Thu" },
  { key: "fri", label: "Friday", short: "Fri" },
  { key: "sat", label: "Saturday", short: "Sat" },
  { key: "sun", label: "Sunday", short: "Sun" },
]

interface WorkingHoursEditorProps {
  value: WorkingHours | null
  onChange: (value: WorkingHours | null) => void
  error?: string
  disabled?: boolean
}

export function WorkingHoursEditor({
  value,
  onChange,
  error,
  disabled = false,
}: WorkingHoursEditorProps) {
  const hours = value ?? {}

  const updateHours = (newHours: WorkingHours) => {
    onChange(Object.keys(newHours).length ? newHours : null)
  }

  const handleToggleDay = (day: DayKey, enabled: boolean) => {
    const updated = { ...hours }
    if (enabled) {
      updated[day] = ["09:00-17:00"]
    } else {
      delete updated[day]
    }
    updateHours(updated)
  }

  const handleAddRange = (day: DayKey) => {
    const updated = { ...hours }
    updated[day] = [...(updated[day] ?? []), "09:00-17:00"]
    updateHours(updated)
  }

  const handleRemoveRange = (day: DayKey, index: number) => {
    const updated = { ...hours }
    const ranges = [...(updated[day] ?? [])]
    ranges.splice(index, 1)
    if (ranges.length === 0) {
      delete updated[day]
    } else {
      updated[day] = ranges
    }
    updateHours(updated)
  }

  const handleUpdateRange = (
    day: DayKey,
    index: number,
    type: "start" | "end",
    newTime: string
  ) => {
    const updated = { ...hours }
    const ranges = [...(updated[day] ?? [])]
    const current = ranges[index] || "09:00-17:00"
    const [start, end] = current.split("-")

    ranges[index] = type === "start" ? `${newTime}-${end}` : `${start}-${newTime}`
    updated[day] = ranges
    updateHours(updated)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Weekly Working Hours
        </Label>
        {error && <p className="text-xs font-medium text-destructive">{error}</p>}
      </div>

      <div className="rounded-lg border border-border/60 bg-card overflow-hidden shadow-xs">
        <div className="divide-y divide-border/40">
          {DAYS.map((day) => {
            const enabled = !!hours[day.key]
            const ranges = hours[day.key] ?? []

            return (
              <div
                key={day.key}
                className={cn(
                  "p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition-colors",
                  enabled ? "bg-card" : "bg-muted/15"
                )}
              >
                {/* Day label and toggle */}
                <div className="flex items-center justify-between sm:justify-start gap-3 sm:w-44 shrink-0 pt-1">
                  <Switch
                    checked={enabled}
                    disabled={disabled}
                    onCheckedChange={(checked) => handleToggleDay(day.key, checked)}
                    aria-label={`Toggle ${day.label}`}
                  />
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        enabled ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {day.label}
                    </span>
                    {!enabled && (
                      <span className="text-[11px] text-muted-foreground italic sm:hidden">
                        (Closed)
                      </span>
                    )}
                  </div>
                </div>

                {/* Working hours slots */}
                <div className="flex-1 min-w-0">
                  {enabled ? (
                    <div className="space-y-2">
                      {ranges.map((range, index) => {
                        const [start = "09:00", end = "17:00"] = range.split("-")
                        return (
                          <div
                            key={index}
                            className="flex flex-wrap items-center gap-2"
                          >
                            <div className="w-[180px]">
                              <DashboardTimePicker
                                value={start}
                                onChange={(val) =>
                                  handleUpdateRange(day.key, index, "start", val)
                                }
                                disabled={disabled}
                                ariaLabel={`${day.label} start time slot ${index + 1}`}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground select-none px-0.5">
                              to
                            </span>
                            <div className="w-[180px]">
                              <DashboardTimePicker
                                value={end}
                                onChange={(val) =>
                                  handleUpdateRange(day.key, index, "end", val)
                                }
                                disabled={disabled}
                                ariaLabel={`${day.label} end time slot ${index + 1}`}
                              />
                            </div>

                            {!disabled && ranges.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveRange(day.key, index)}
                                aria-label={`Remove slot ${index + 1} for ${day.label}`}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        )
                      })}

                      {!disabled && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                          onClick={() => handleAddRange(day.key)}
                        >
                          <Plus className="size-3" />
                          <span>Add slot</span>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="py-1">
                      <span className="text-xs text-muted-foreground italic hidden sm:inline">
                        Closed
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}