"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ShieldAlert, LayoutDashboard, ScrollText } from "lucide-react"
import type { PlatformContext } from "../access.types"

export interface AdminNavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

export const ADMIN_NAV_CONFIG: AdminNavItem[] = [
  {
    title: "Overview",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Audit Logs",
    url: "/admin/audit-logs",
    icon: ScrollText,
  },
]

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  context: PlatformContext
}

export function AdminSidebar({ context, ...props }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldAlert className="size-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold tracking-tight">ClinicSeva Admin</span>
            <span className="truncate text-xs text-muted-foreground">Platform Control</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Platform Management
          </SidebarGroupLabel>
          <SidebarMenu>
            {ADMIN_NAV_CONFIG.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.url || (item.url !== "/admin" && pathname.startsWith(item.url))
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={item.title}
                    render={<Link href={item.url} />}
                  >
                    <Icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate font-medium text-foreground">{context.fullName}</span>
          <span className="capitalize font-mono text-[10px]">{context.role === "super_admin" ? "super" : "support"}</span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
