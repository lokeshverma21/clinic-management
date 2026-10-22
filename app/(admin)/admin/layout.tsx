import * as React from "react"
import { redirect, notFound } from "next/navigation"
import { getPlatformContext } from "@/modules/admin/access"
import { AdminShell } from "@/modules/admin/access/components/admin-shell"
import { UnauthenticatedError, ForbiddenError } from "@/lib/errors/app-error"

export const metadata = {
  title: "Platform Admin | ClinicSeva",
  description: "Platform administration and oversight portal.",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let context
  try {
    context = await getPlatformContext()
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      redirect("/sign-in")
    }

    if (error instanceof ForbiddenError && error.code === "NOT_PLATFORM_ADMIN") {
      notFound()
    }

    throw error
  }

  return <AdminShell context={context}>{children}</AdminShell>
}
