"use client"

import * as React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { UserButton, Show } from "@clerk/nextjs"
import type { PlatformContext } from "../access.types"

interface AdminHeaderProps {
  context: PlatformContext
}

export function AdminHeader({ context }: AdminHeaderProps) {
  const isSuperAdmin = context.role === "super_admin"

  return (
    <header className="flex h-16 items-center justify-between gap-2 border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Platform Administration
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-xs font-medium leading-none text-foreground">{context.fullName}</p>
          <p className="text-[11px] text-muted-foreground">{context.email}</p>
        </div>
        <Badge
          variant={isSuperAdmin ? "default" : "secondary"}
          className="capitalize text-[11px]"
        >
          {isSuperAdmin ? "Super Admin" : "Support"}
        </Badge>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  )
}
