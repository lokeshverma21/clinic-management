"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function StaffPendingOnboardingView() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 max-w-md w-full rounded-xl border border-border bg-card text-card-foreground shadow-xs space-y-4">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">Clinic setup in progress</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your clinic&apos;s setup isn&apos;t finished yet. Please ask your clinic owner to complete it.
        </p>
      </div>
      <div className="pt-2">
        <SignOutButton redirectUrl="/sign-in">
          <Button size="sm" variant="outline">
            Sign out
          </Button>
        </SignOutButton>
      </div>
    </div>
  );
}
