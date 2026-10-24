"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SetupPending() {
  const router = useRouter();
  const [secondsElapsed, setSecondsElapsed] = React.useState(0);
  const isTimeout = secondsElapsed >= 20;

  React.useEffect(() => {
    if (isTimeout) return;

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 2);
      router.refresh();
    }, 2000);

    return () => clearInterval(interval);
  }, [isTimeout, router]);

  const handleTryAgain = () => {
    setSecondsElapsed(0);
    router.refresh();
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 max-w-md w-full rounded-xl border border-border bg-card text-card-foreground shadow-xs space-y-4">
      {!isTimeout ? (
        <>
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Loader2 className="size-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">Setting up your account...</h2>
            <p className="text-xs text-muted-foreground">
              Please wait a moment while we prepare your workspace.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">This is taking longer than expected</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We&apos;re still finishing up your account. You can try refreshing or sign out and try again.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button size="sm" onClick={handleTryAgain}>
              Try again
            </Button>
            <SignOutButton redirectUrl="/sign-in">
              <Button size="sm" variant="outline">
                Sign out
              </Button>
            </SignOutButton>
          </div>
        </>
      )}
    </div>
  );
}
