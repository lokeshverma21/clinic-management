"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md text-center space-y-5">
        <div className="text-5xl">⚠️</div>

        <h1 className="text-2xl font-bold">
          Something went wrong
        </h1>

        <p className="text-muted-foreground">
          An unexpected error occurred while loading this page.
          Please try again.
        </p>

        <button
          onClick={reset}
          className="rounded-md bg-primary px-5 py-2 text-primary-foreground transition hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}