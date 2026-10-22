import * as React from "react"
import { getPlatformContext } from "@/modules/admin/access"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, ShieldCheck, UserCheck, Layers } from "lucide-react"

export const metadata = {
  title: "Admin Overview | ClinicSeva",
  description: "Platform admin overview and status.",
}

export default async function AdminOverviewPage() {
  const context = await getPlatformContext()
  const isSuperAdmin = context.role === "super_admin"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">
          Platform-level administrative control, tenant health, and operations oversight.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Admin</CardTitle>
            <UserCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{context.fullName}</div>
            <p className="text-xs text-muted-foreground mt-1">{context.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access Tier</CardTitle>
            {isSuperAdmin ? (
              <ShieldAlert className="size-4 text-primary" />
            ) : (
              <ShieldCheck className="size-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={isSuperAdmin ? "default" : "secondary"} className="capitalize">
                {isSuperAdmin ? "Super Admin" : "Support"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isSuperAdmin
                ? "Full read/write permissions across all platform services."
                : "Read-only access across platform monitoring surfaces."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Status</CardTitle>
            <Layers className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500" />
              Active Session
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Connected via secure platform admin guard.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Platform Management Modules</CardTitle>
          <CardDescription>
            The platform-admin control center is structured into modular sections.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-md border p-3">
            <div className="font-medium text-foreground">Module 1: Access & Shell</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Platform admin guard, role-based assertion helpers, and administrative navigation shell (Active).
            </p>
          </div>
          <div className="rounded-md border border-dashed p-3">
            <div className="font-medium text-foreground">Upcoming Modules</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tenants overview, clinic subscription oversight, global audit trails, and platform settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
