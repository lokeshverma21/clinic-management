import * as React from "react"
import { getPlatformContext } from "@/modules/admin/access"
import { AuditLogsView } from "@/modules/admin/audit-logs/components/audit-logs-view"

export const metadata = {
  title: "Audit Logs | ClinicSeva Admin",
  description: "Platform audit trail of administrative actions and tenant events.",
}

export default async function AdminAuditLogsPage() {
  // Enforces platform admin authentication and role verification
  await getPlatformContext()

  return <AuditLogsView />
}
