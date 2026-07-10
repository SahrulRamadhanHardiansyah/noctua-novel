"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function MainError({
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
    <div className="bg-[#09090b] min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="bg-red-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
        <p className="text-zinc-500 mb-6">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
          <Button onClick={() => window.location.href = "/"} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
