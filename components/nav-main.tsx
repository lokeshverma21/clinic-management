"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRight } from "lucide-react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80 px-2 py-1.5">
        Configuration
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const isSectionActive = Boolean(
            item.items?.some((sub) => pathname.startsWith(sub.url)),
          )

          return (
            <Collapsible
              key={item.title}
              defaultOpen={item.isActive || isSectionActive}
              className="group/collapsible"
              render={<SidebarMenuItem />}
            >
              <CollapsibleTrigger
                render={
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                  />
                }
              >
                {item.icon}
                <span className="text-xs">{item.title}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90 size-3.5 text-muted-foreground/70" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className="my-1 border-l border-border/60">
                  {item.items?.map((subItem) => {
                    const isSubActive = pathname === subItem.url

                    return (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          render={<Link href={subItem.url} />}
                          isActive={isSubActive}
                          className={
                            isSubActive
                              ? "bg-primary/10 text-primary font-medium hover:bg-primary/15 transition-colors"
                              : "text-muted-foreground hover:text-foreground transition-colors"
                          }
                        >
                          <span className="text-xs">{subItem.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
