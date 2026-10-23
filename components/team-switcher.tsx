"use client"

import * as React from "react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ReactNode
    plan?: string
  }[]
}) {
  const activeTeam = teams[0]
  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="hover:bg-transparent cursor-default group-data-[collapsible=icon]:p-0"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
            {activeTeam.logo}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight ml-0.5">
            <span className="truncate font-semibold text-foreground text-xs sm:text-sm">
              {activeTeam.name}
            </span>
            {activeTeam.plan && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant="outline"
                  className="w-fit text-[10px] font-mono font-medium px-1.5 py-0 uppercase bg-muted/60 text-muted-foreground border-border/80"
                >
                  {activeTeam.plan}
                </Badge>
              </div>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
