"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white px-6">
      <div className="bg-red-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-10 h-10 text-red-400" />
      </div>
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-zinc-500 mb-8 text-center max-w-md">
        An unexpected error occurred. Please try again later.
      </p>
      <Button onClick={reset} size="lg">
        Try Again
      </Button>
    </div>
  );
}
