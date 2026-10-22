"use client"

import * as React from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import type { PlatformContext } from "../access.types"

interface AdminShellProps {
  context: PlatformContext
  children: React.ReactNode
}

export function AdminShell({ context, children }: AdminShellProps) {
  return (
    <SidebarProvider>
      <AdminSidebar context={context} />
      <SidebarInset>
        <AdminHeader context={context} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
