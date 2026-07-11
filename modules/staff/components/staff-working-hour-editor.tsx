"use client"

import * as React from "react"
import { Plus, Trash2, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

import type { WorkingHours } from "../staff.types"

type DayKey = keyof WorkingHours

const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
]

interface WorkingHoursEditorProps {
  value: WorkingHours | null
  onChange: (value: WorkingHours | null) => void
  error?: string
}

export function WorkingHoursEditor({
  value,
  onChange,
  error,
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
    value: string
  ) => {
    const updated = { ...hours }

    const ranges = [...(updated[day] ?? [])]

    const [start, end] = ranges[index].split("-")

    ranges[index] =
      type === "start"
        ? `${value}-${end}`
        : `${start}-${value}`

    updated[day] = ranges

    updateHours(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Working Hours
        </Label>

        {error && (
          <p className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/30">
        <div className="divide-y divide-border/40">
          {DAYS.map((day) => {
            const enabled = !!hours[day.key]
            const ranges = hours[day.key] ?? []

            return (
              <div
                key={day.key}
                className="space-y-3 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg border text-[11px] font-bold uppercase",
                        enabled
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-border/60 bg-muted text-muted-foreground"
                      )}
                    >
                      {day.key.slice(0, 2)}
                    </div>

                    <span
                      className={cn(
                        "text-sm font-medium",
                        enabled
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {day.label}
                    </span>
                  </div>

                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) =>
                      handleToggleDay(day.key, checked)
                    }
                  />
                </div>

                {enabled ? (
                  <div className="space-y-2 pl-11">
                    {ranges.map((range, index) => {
                      const [start, end] = range.split("-")

                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2"
                        >
                          <div className="relative flex-1 max-w-[140px]">
                            <Clock className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />

                            <Input
                              type="time"
                              value={start}
                              onChange={(e) =>
                                handleUpdateRange(
                                  day.key,
                                  index,
                                  "start",
                                  e.target.value
                                )
                              }
                              className="h-9 bg-background pl-8 text-xs"
                            />
                          </div>

                          <span className="text-xs text-muted-foreground">
                            —
                          </span>

                          <div className="relative flex-1 max-w-[140px]">
                            <Clock className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />

                            <Input
                              type="time"
                              value={end}
                              onChange={(e) =>
                                handleUpdateRange(
                                  day.key,
                                  index,
                                  "end",
                                  e.target.value
                                )
                              }
                              className="h-9 bg-background pl-8 text-xs"
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() =>
                              handleRemoveRange(day.key, index)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}

                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto gap-1 p-0 text-[11px] font-semibold"
                      onClick={() => handleAddRange(day.key)}
                    >
                      <Plus className="h-3 w-3" />
                      Add Time Slot
                    </Button>
                  </div>
                ) : (
                  <div className="pl-11">
                    <p className="text-[11px] italic text-muted-foreground">
                      Not Available
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}