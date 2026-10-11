"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface AutoEmailRemindersToggleProps {
  initialEnabled: boolean;
  canEdit: boolean;
}

export function AutoEmailRemindersToggle({ initialEnabled, canEdit }: AutoEmailRemindersToggleProps) {
  const [enabled, setEnabled] = React.useState(initialEnabled)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setEnabled(initialEnabled)
  }, [initialEnabled])

  const handleChange = async (checked: boolean) => {
    if (!canEdit) {
      return
    }

    const previous = enabled
    setEnabled(checked)
    setError(null)
    setIsSaving(true)

    try {
      const response = await fetch("/api/notifications/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoEmailRemindersEnabled: checked }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error?.message ?? "Could not update notification settings")
      }
      setEnabled(result.data.settings.autoEmailRemindersEnabled)
    } catch (err) {
      setEnabled(previous)
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="auto-email-reminders"
            className={cn(
              "text-xs font-medium text-muted-foreground whitespace-nowrap",
              !canEdit && "cursor-default",
            )}
          >
            Auto Email Reminders
          </Label>
          <Switch
            id="auto-email-reminders"
            checked={enabled}
            onCheckedChange={handleChange}
            disabled={!canEdit || isSaving}
            aria-describedby={error ? "auto-email-reminders-error" : undefined}
          />
        </div>
        {error ? (
          <p id="auto-email-reminders-error" className="text-[10px] text-destructive max-w-[200px] text-right">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}
