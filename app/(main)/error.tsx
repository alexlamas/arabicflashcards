"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowCounterClockwise } from "@phosphor-icons/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to help debug
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-heading mb-2">
          Something went wrong
        </h1>
        <p className="text-body mb-6">
          We ran into an unexpected error. Please try again.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            onClick={reset}
            className="rounded-full"
          >
            <ArrowCounterClockwise className="h-4 w-4 mr-2" />
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/"}
            className="rounded-full"
          >
            Go to home
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-red-50 rounded-lg text-left">
            <p className="text-sm font-mono text-red-700 break-all">
              {error.message}
            </p>
            {error.stack && (
              <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-40">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
