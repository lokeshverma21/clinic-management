"use client"

import * as React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface StaffAvatarProps {
  name: string;
  className?: string;
}

export function StaffAvatar({ name, className }: StaffAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={cn("h-8 w-8 border border-border/60", className)}>
      <AvatarFallback className="text-[10px] bg-primary/5 text-primary font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
