"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DashboardTimePicker } from "@/components/dashboard/dashboard-time-picker"
import { cn } from "@/lib/utils"
import type { WeeklyHours } from "../clinic-profile.types"

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'mon', label: 'Monday', short: 'Mon' },
  { key: 'tue', label: 'Tuesday', short: 'Tue' },
  { key: 'wed', label: 'Wednesday', short: 'Wed' },
  { key: 'thu', label: 'Thursday', short: 'Thu' },
  { key: 'fri', label: 'Friday', short: 'Fri' },
  { key: 'sat', label: 'Saturday', short: 'Sat' },
  { key: 'sun', label: 'Sunday', short: 'Sun' },
];

interface OperatingHoursEditorProps {
  value: WeeklyHours | null;
  onChange: (value: WeeklyHours | null) => void;
  error?: string;
  disabled?: boolean;
}

export function OperatingHoursEditor({
  value,
  onChange,
  error,
  disabled = false,
}: OperatingHoursEditorProps) {
  const hours = value || {};

  const handleToggleDay = (day: DayKey, checked: boolean) => {
    const newHours = { ...hours };
    if (checked) {
      newHours[day] = ["09:00-17:00"];
    } else {
      delete newHours[day];
    }
    onChange(Object.keys(newHours).length > 0 ? newHours : null);
  };

  const handleAddRange = (day: DayKey) => {
    const newHours = { ...hours };
    const currentRanges = newHours[day] || [];
    newHours[day] = [...currentRanges, "09:00-17:00"];
    onChange(newHours);
  };

  const handleRemoveRange = (day: DayKey, index: number) => {
    const newHours = { ...hours };
    const currentRanges = newHours[day] || [];
    const updatedRanges = currentRanges.filter((_, i) => i !== index);
    
    if (updatedRanges.length === 0) {
      delete newHours[day];
    } else {
      newHours[day] = updatedRanges;
    }
    
    onChange(Object.keys(newHours).length > 0 ? newHours : null);
  };

  const handleUpdateRange = (day: DayKey, index: number, part: 'start' | 'end', newValue: string) => {
    const newHours = { ...hours };
    const currentRanges = [...(newHours[day] || [])];
    const [start, end] = (currentRanges[index] || "09:00-17:00").split('-');
    
    if (part === 'start') {
      currentRanges[index] = `${newValue}-${end}`;
    } else {
      currentRanges[index] = `${start}-${newValue}`;
    }
    
    newHours[day] = currentRanges;
    onChange(newHours);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Weekly Operating Hours
        </Label>
        {error && (
          <p className="text-xs font-medium text-destructive">{error}</p>
        )}
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden bg-card shadow-xs">
        <div className="divide-y divide-border/40">
          {DAYS.map((day) => {
            const isActive = !!hours[day.key];
            const ranges = hours[day.key] || [];

            return (
              <div
                key={day.key}
                className={cn(
                  "p-3.5 space-y-2.5 transition-colors",
                  isActive ? "bg-card" : "bg-muted/15"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-xs font-semibold w-10 text-left transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {day.short}
                    </span>
                    <span className={cn(
                      "text-xs font-medium hidden sm:inline transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {day.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {!isActive && (
                      <span className="text-xs text-muted-foreground italic">Closed</span>
                    )}
                    <Switch 
                      checked={isActive} 
                      disabled={disabled}
                      onCheckedChange={(checked) => handleToggleDay(day.key, checked)}
                      aria-label={`Toggle ${day.label}`}
                    />
                  </div>
                </div>

                {isActive && (
                  <div className="sm:pl-13 space-y-2 pt-1 border-t border-border/30 sm:border-0 sm:pt-0">
                    {ranges.map((range, index) => {
                      const [start, end] = range.split('-');
                      return (
                        <div key={index} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          <div className="w-[120px] sm:w-[130px]">
                            <DashboardTimePicker 
                              value={start || "09:00"}
                              disabled={disabled}
                              onChange={(val) => handleUpdateRange(day.key, index, 'start', val)}
                              ariaLabel={`${day.label} start time`}
                            />
                          </div>
                          <span className="text-muted-foreground text-xs font-medium px-0.5">—</span>
                          <div className="w-[120px] sm:w-[130px]">
                            <DashboardTimePicker 
                              value={end || "17:00"}
                              disabled={disabled}
                              onChange={(val) => handleUpdateRange(day.key, index, 'end', val)}
                              ariaLabel={`${day.label} end time`}
                            />
                          </div>
                          {!disabled && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveRange(day.key, index)}
                              className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              aria-label={`Remove time slot for ${day.label}`}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                    {!disabled && (
                      <Button 
                        type="button" 
                        variant="link" 
                        size="sm" 
                        onClick={() => handleAddRange(day.key)}
                        className="h-auto p-0 text-xs font-medium text-primary hover:text-primary/80 gap-1 mt-1"
                      >
                        <Plus className="size-3" />
                        Add Split Shift
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}
