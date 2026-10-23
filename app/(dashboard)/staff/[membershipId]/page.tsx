import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getRequestContext } from "@/lib/auth/request-context"
import { listStaff } from "@/modules/staff"
import { listAppointments } from "@/modules/appointments"
import { StaffDetailsView } from "@/modules/staff/components/staff-details-view"
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import { format, subMonths, addMonths } from "date-fns"

interface StaffDetailsPageProps {
  params: Promise<{ membershipId: string }>
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function generateMetadata({ params }: StaffDetailsPageProps): Promise<Metadata> {
  const { membershipId } = await params
  if (!UUID_REGEX.test(membershipId)) {
    return { title: "Invalid Staff Member | ClinicSeva" }
  }

  try {
    const ctx = await getRequestContext()
    const allStaff = await listStaff(ctx)
    const staff = allStaff.find((s) => s.membershipId === membershipId)
    if (!staff) return { title: "Staff Member Not Found | ClinicSeva" }

    const name = staff.user?.fullName ?? staff.invitedEmail ?? "Staff Member"
    return {
      title: `${name} | Staff Profile - ClinicSeva`,
      description: `Staff role, schedule, and appointment history for ${name}.`,
    }
  } catch {
    return { title: "Staff Profile | ClinicSeva" }
  }
}

export default async function StaffDetailsPage({ params }: StaffDetailsPageProps) {
  const { membershipId } = await params

  // 1. Validate route parameter UUID
  if (!UUID_REGEX.test(membershipId)) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <DashboardEmptyState
          icon={AlertCircle}
          title="Invalid staff identifier"
          description={`The identifier "${membershipId}" is not a valid UUID.`}
          action={
            <Link
              href="/staff"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2 h-9 text-xs")}
            >
              <ArrowLeft className="size-4" />
              <span>Back to staff</span>
            </Link>
          }
        />
      </div>
    )
  }

  // 2. Resolve request context & clinic scoping
  const ctx = await getRequestContext()

  // 3. Find the staff member from the current clinic
  const allStaff = await listStaff(ctx)
  const staff = allStaff.find((s) => s.membershipId === membershipId)

  if (!staff) {
    notFound()
  }

  // 4. Protection rules
  const activeOwnerCount = allStaff.filter((s) => s.role === "owner" && s.status === "active").length
  const isLastActiveOwner = staff.role === "owner" && staff.status === "active" && activeOwnerCount <= 1

  // 5. Permission trap check:
  // The appointments service enforces doctor self-scoping.
  // Viewing appointment history is only permitted if:
  // - Current user is an owner or receptionist, OR
  // - Current user IS this doctor (self viewing self).
  const isSelf = ctx.membershipId === staff.membershipId
  const canViewHistory = ctx.role === "owner" || ctx.role === "receptionist" || isSelf
  const isDoctor = staff.role === "doctor" || staff.role === "owner"
  const isInvited = staff.status === "invited" || !staff.user

  let appointments: Awaited<ReturnType<typeof listAppointments>>["appointments"] = []
  let historyNote: string | undefined

  if (!canViewHistory) {
    historyNote = "Appointment history is restricted to clinic owners, receptionists, or the practitioner themselves."
  } else if (!isDoctor) {
    historyNote = "Clinical consultation history is only applicable to doctor staff roles."
  } else if (isInvited) {
    historyNote = "This member is currently in invited status. Appointments will appear after registration."
  } else {
    try {
      const from = format(subMonths(new Date(), 12), "yyyy-MM-dd")
      const to = format(addMonths(new Date(), 6), "yyyy-MM-dd")
      const res = await listAppointments(ctx, {
        from,
        to,
        doctorId: staff.membershipId,
      })
      appointments = res.appointments
    } catch (err) {
      console.error("Failed to fetch appointment history for staff member", err)
      historyNote = "Unable to load appointment history at this time."
    }
  }

  return (
    <StaffDetailsView
      staff={staff}
      currentMembershipId={ctx.membershipId}
      currentRole={ctx.role}
      isLastActiveOwner={isLastActiveOwner}
      canViewHistory={canViewHistory}
      historyNote={historyNote}
      appointments={appointments}
    />
  )
}
