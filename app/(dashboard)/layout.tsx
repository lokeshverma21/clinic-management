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

import { ForbiddenError, UnauthenticatedError } from "@/lib/errors/app-error";
import { NoMembershipView } from "@/app/(auth)/continue/no-membership-view";
import { StaffPendingOnboardingView } from "@/app/(auth)/continue/staff-pending-onboarding-view";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  let ctx;
  try {
    ctx = await getRequestContext();
  } catch (err) {
    if (err instanceof ForbiddenError && err.code === "NO_ACTIVE_MEMBERSHIP") {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <NoMembershipView />
        </div>
      );
    }
    if (err instanceof UnauthenticatedError) {
      redirect("/continue");
    }
    throw err;
  }

  const clinic = await getClinicProfile(ctx);
  const notificationSettings = await getNotificationSettings(ctx);

  if (!clinic.onboardingCompletedAt) {
    if (ctx.role === "owner") {
      redirect("/onboarding/clinic");
    }
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <StaffPendingOnboardingView />
      </div>
    );
  }


  const sidebarUser = {
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Clinic Member",
    email: user.emailAddresses[0]?.emailAddress ?? "",
    avatar: user.imageUrl,
  };

  const sidebarClinic = {
    name: clinic.name,
    logoUrl: clinic.logoUrl,
    plan: clinic.status.toUpperCase(), // e.g., 'TRIAL', 'ACTIVE'
  };

  return (
    <SidebarProvider>
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="afterInteractive"
      />
      <AppSidebar user={sidebarUser} clinic={sidebarClinic} />

      <SidebarInset className="min-h-screen bg-background flex flex-col">
        {/* Dashboard Top Header Bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border/60 bg-card/85 backdrop-blur-md px-4 sm:px-6 transition-colors">
          <div className="flex items-center gap-2.5">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors" />

            <Separator
              orientation="vertical"
              className="h-4 bg-border/70"
            />

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-tight text-foreground font-sans">
                ClinicSeva
              </span>
              <span className="text-muted-foreground/60 text-xs hidden sm:inline">
                /
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline font-medium">
                {clinic.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <AutoEmailRemindersToggle
              initialEnabled={notificationSettings.autoEmailRemindersEnabled}
              canEdit={ctx.role === "owner"}
            />
            <Separator
              orientation="vertical"
              className="h-4 bg-border/60 hidden sm:block"
            />
            <div className="flex items-center">
              <Show when="signed-in">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "size-8 ring-1 ring-border/80 shadow-xs",
                    },
                  }}
                />
              </Show>
            </div>
          </div>
        </header>

        {/* Status / Suspension / Grace Banner */}
        <ClinicStatusBanner clinic={clinic} />

        {/* Dashboard Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}