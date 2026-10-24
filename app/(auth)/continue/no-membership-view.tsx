"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function NoMembershipView() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 max-w-md w-full rounded-xl border border-border bg-card text-card-foreground shadow-xs space-y-4">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">No clinic membership found</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your account isn&apos;t linked to a clinic yet. If you were invited, ask the clinic owner to send a new invitation.
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
