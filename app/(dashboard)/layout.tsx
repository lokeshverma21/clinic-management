import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { getRequestContext } from "@/lib/auth/request-context";
import { getClinicProfile } from "@/modules/clinic-profile";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const user = await currentUser()
  if (!user) redirect("/sign-in")

  const ctx = await getRequestContext();

  const clinic = await getClinicProfile(ctx);

  if (!clinic.onboardingCompletedAt) {
      redirect("/onboarding/clinic");
  }

  const sidebarUser = {
    name: `${user.firstName} ${user.lastName}`,
    email: user.emailAddresses[0].emailAddress,
    avatar: user.imageUrl,
  }

  const sidebarClinic = {
    name: clinic.name,
    logoUrl: clinic.logoUrl,
    plan: clinic.status.toUpperCase(), // e.g., 'TRIAL', 'ACTIVE'
  }

  return (
    <SidebarProvider>
      <AppSidebar user={sidebarUser} clinic={sidebarClinic} />

      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger />

          <Separator
            orientation="vertical"
            className="h-4"
          />

          {/* Later you can add breadcrumbs, search, profile, etc. */}
          <h1 className="font-medium">ClinicOS</h1>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}