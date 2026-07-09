"use client"

import * as React from "react"
import { Plus, Trash2, Clock, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { WeeklyHours } from "../clinic-profile.types"

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

interface OperatingHoursEditorProps {
  value: WeeklyHours | null;
  onChange: (value: WeeklyHours | null) => void;
  error?: string;
}

export function OperatingHoursEditor({ value, onChange, error }: OperatingHoursEditorProps) {
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
    const [start, end] = currentRanges[index].split('-');
    
    if (part === 'start') {
      currentRanges[index] = `${newValue}-${end}`;
    } else {
      currentRanges[index] = `${start}-${newValue}`;
    }
    
    newHours[day] = currentRanges;
    onChange(newHours);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Operating Hours
        </Label>
        {error && (
          <p className="text-xs font-medium text-destructive">{error}</p>
        )}
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden bg-card/30">
        <div className="divide-y divide-border/40">
          {DAYS.map((day) => {
            const isActive = !!hours[day.key];
            const ranges = hours[day.key] || [];

            return (
              <div key={day.key} className="p-4 space-y-3 transition-colors hover:bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg border text-[11px] font-bold uppercase transition-all",
                      isActive 
                        ? "bg-primary/10 border-primary/20 text-primary" 
                        : "bg-muted border-border/60 text-muted-foreground"
                    )}>
                      {day.key.substring(0, 2)}
                    </div>
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {day.label}
                    </span>
                  </div>
                  <Switch 
                    checked={isActive} 
                    onCheckedChange={(checked) => handleToggleDay(day.key, checked)}
                  />
                </div>

                {isActive && (
                  <div className="pl-11 space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                    {ranges.map((range, index) => {
                      const [start, end] = range.split('-');
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <div className="relative flex-1 max-w-[140px]">
                            <Clock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input 
                              type="time" 
                              value={start}
                              onChange={(e) => handleUpdateRange(day.key, index, 'start', e.target.value)}
                              className="pl-8 h-9 text-xs bg-background"
                            />
                          </div>
                          <span className="text-muted-foreground text-xs font-medium">—</span>
                          <div className="relative flex-1 max-w-[140px]">
                            <Clock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input 
                              type="time" 
                              value={end}
                              onChange={(e) => handleUpdateRange(day.key, index, 'end', e.target.value)}
                              className="pl-8 h-9 text-xs bg-background"
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveRange(day.key, index)}
                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                    <Button 
                      type="button" 
                      variant="link" 
                      size="sm" 
                      onClick={() => handleAddRange(day.key)}
                      className="h-auto p-0 text-[11px] font-semibold text-primary hover:text-primary/80 gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Range
                    </Button>
                  </div>
                )}
                {!isActive && (
                  <div className="pl-11">
                    <p className="text-[11px] text-muted-foreground italic">Closed</p>
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
