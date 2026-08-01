"use client"

import * as React from "react"

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
import { 
  AudioWaveform, 
  Command, 
  Terminal, 
  Bot, 
  BookOpen, 
  Settings2, 
  Frame, 
  PieChart, 
  Map, 
  UserSquare2,
  Users,
  Calendar,
  LayoutDashboard,
  Receipt
} from "lucide-react"
import { Dna } from "lucide-react"
import Image from "next/image"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "ClinicOS",
      logo: (
        <Dna strokeWidth={2} />
      ),
      plan: "Enterprise",
    },
    // {
    //   name: "Acme Corp.",
    //   logo: (
    //     <AudioWaveform className="size-4" />
    //   ),
    //   plan: "Startup",
    // },
    // {
    //   name: "Evil Corp.",
    //   logo: (
    //     <Command className="size-4" />
    //   ),
    //   plan: "Free",
    // },
  ],
  
  navMain: [
    // {
    //   title: "Dashboard",
    //   url: "/dashboard",
    //   icon: (
    //     <Terminal />
    //   ),
    //   isActive: true,
    //   items: [
    //     {
    //       title: "History",
    //       url: "#",
    //     },
    //     {
    //       title: "Starred",
    //       url: "#",
    //     },
    //     {
    //       title: "Settings",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Models",
    //   url: "#",
    //   icon: (
    //     <Bot />
    //   ),
    //   items: [
    //     {
    //       title: "Genesis",
    //       url: "#",
    //     },
    //     {
    //       title: "Explorer",
    //       url: "#",
    //     },
    //     {
    //       title: "Quantum",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Documentation",
    //   url: "#",
    //   icon: (
    //     <BookOpen />
    //   ),
    //   items: [
    //     {
    //       title: "Introduction",
    //       url: "#",
    //     },
    //     {
    //       title: "Get Started",
    //       url: "#",
    //     },
    //     {
    //       title: "Tutorials",
    //       url: "#",
    //     },
    //     {
    //       title: "Changelog",
    //       url: "#",
    //     },
    //   ],
    // },
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2 />
      ),
      items: [
        {
          title: "Clinic Profile",
          url: "/settings/clinic-profile",
        },
        // {
        //   title: "Team",
        //   url: "#",
        // },
        {
          title: "Billing",
          url: "/settings/billing",
        },
        // {
        //   title: "Limits",
        //   url: "#",
        // },
      ],
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: (
        <Frame />
      ),
    },
    {
      name: "Appointments",
      url: "/appointments",
      icon: (
        <PieChart />
      ),
    },
    {
      name: "Patients",
      url: "/patients",
      icon: (
        <Map />
      ),
    },
    {
      name: "Staff",
      url: "/staff",
      icon: (
        <Map />
      ),
    },
  ],
}


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

export function AppSidebar({user, clinic,...props }: AppSidebarProps) {

  const navigation = {
    teams: [
      {
        name: clinic.name,
        logo: clinic.logoUrl ? <Image src={clinic.logoUrl} alt={clinic.name} width={32} height={32} /> : <Dna />,
        plan: clinic.plan,
      },
    ],
    navMain: [
      {
        title: "Settings",
        url: "#",
        icon: <Settings2 />,
        items: [
          { title: "Clinic Profile", url: "/settings/clinic-profile" },
          { title: "Billing", url: "/settings/billing" },
        ],
      },
    ],
    projects: [
      { name: "Dashboard", url: "/dashboard", icon: <LayoutDashboard /> },
      { name: "Appointments", url: "/appointments", icon:  <Calendar /> },
      { name: "Patients", url: "/patients", icon: <Users /> },
      { name: "Staff", url: "/staff", icon: <UserSquare2 /> },
      { name: "Billing", url: "/billing", icon: <Receipt /> },
    ],
  }
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={navigation.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={navigation.projects} />
        <NavMain items={navigation.navMain} />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  )
}
