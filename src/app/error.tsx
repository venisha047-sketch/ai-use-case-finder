"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 mb-6">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">
        An unexpected error occurred. Our team has been notified.
        {error.digest && (
          <span className="block mt-1 font-mono text-xs opacity-60">
            Error ID: {error.digest}
          </span>
        )}
      </p>
      <Button onClick={reset} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
