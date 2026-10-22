import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { getRequestContext } from "@/lib/auth/request-context";
import { getClinicProfile } from "@/modules/clinic-profile";
import { getNotificationSettings } from "@/modules/notifications";
import { AutoEmailRemindersToggle } from "@/modules/notifications/components/auto-email-reminders-toggle";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Show, UserButton } from "@clerk/nextjs";
import Script from "next/script";
import { ClinicStatusBanner } from "@/modules/subscriptions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const user = await currentUser()
  if (!user) redirect("/sign-in")

  const ctx = await getRequestContext();

  const clinic = await getClinicProfile(ctx);
  const notificationSettings = await getNotificationSettings(ctx);

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
      <Script
          src="https://sdk.cashfree.com/js/v3/cashfree.js"
          strategy="afterInteractive"
      />
      <AppSidebar user={sidebarUser} clinic={sidebarClinic} />

      <SidebarInset>
        <header className="flex h-16 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />

            <Separator
              orientation="vertical"
              className="h-4"
            />

            {/* Later you can add breadcrumbs, search, profile, etc. */}
            <h1 className="font-medium">ClinicSeva</h1>
          </div>
          <div className="flex items-center gap-3">
            <AutoEmailRemindersToggle
              initialEnabled={notificationSettings.autoEmailRemindersEnabled}
              canEdit={ctx.role === "owner"}
            />
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </header>

        <ClinicStatusBanner clinic={clinic} />

        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}