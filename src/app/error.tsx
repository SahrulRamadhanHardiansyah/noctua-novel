"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6">
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        An unexpected error occurred. Please try again later.
      </p>
      <Button onClick={reset} variant="secondary" size="lg">
        Try Again
      </Button>
    </div>
  );
}
