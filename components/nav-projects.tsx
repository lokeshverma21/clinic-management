"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: React.ReactNode
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80 px-2 py-1.5">
        Management
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        {projects.map((item) => {
          const isActive =
            pathname === item.url ||
            (item.url !== "/dashboard" && pathname.startsWith(item.url))

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                render={<Link href={item.url} />}
                isActive={isActive}
                tooltip={item.name}
                className={
                  isActive
                    ? "bg-primary/10 text-primary font-medium hover:bg-primary/15 hover:text-primary transition-colors"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                }
              >
                {item.icon}
                <span className="text-xs">{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
