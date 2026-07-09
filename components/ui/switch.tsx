"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<
  HTMLInputElement,
  SwitchProps
>(({ className, onCheckedChange, ...props }, ref) => (
  <div className="relative inline-flex items-center cursor-pointer group">
    <input
      type="checkbox"
      className={cn("peer sr-only", className)}
      ref={ref}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
    <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
  </div>
))
Switch.displayName = "Switch"

export { Switch }
