"use client"

import * as React from "react"
import Image from "next/image"
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserSquare2,
  Receipt,
  Settings2,
  Stethoscope,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    email: string
    avatar?: string
  }
  clinic: {
    name: string
    logoUrl?: string | null
    plan: string
  }
}

export function AppSidebar({ user, clinic, ...props }: AppSidebarProps) {
  const navigation = {
    teams: [
      {
        name: clinic.name,
        logo: clinic.logoUrl ? (
          <Image
            src={clinic.logoUrl}
            alt={clinic.name}
            width={28}
            height={28}
            className="rounded object-cover"
          />
        ) : (
          <Stethoscope className="size-4 text-primary" strokeWidth={2.2} />
        ),
        plan: clinic.plan,
      },
    ],
    projects: [
      { name: "Dashboard", url: "/dashboard", icon: <LayoutDashboard className="size-4" /> },
      { name: "Appointments", url: "/appointments", icon: <Calendar className="size-4" /> },
      { name: "Patients", url: "/patients", icon: <Users className="size-4" /> },
      { name: "Staff", url: "/staff", icon: <UserSquare2 className="size-4" /> },
      { name: "Billing", url: "/billing", icon: <Receipt className="size-4" /> },
    ],
    navMain: [
      {
        title: "Settings",
        url: "#",
        icon: <Settings2 className="size-4" />,
        items: [
          { title: "Clinic Profile", url: "/settings/clinic-profile" },
          { title: "Subscription", url: "/settings/subscription" },
        ],
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60 bg-sidebar" {...props}>
      <SidebarHeader className="p-3 border-b border-border/40">
        <TeamSwitcher teams={navigation.teams} />
      </SidebarHeader>

      <SidebarContent className="px-1 py-2">
        <NavProjects projects={navigation.projects} />
        <NavMain items={navigation.navMain} />
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border/40">
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
