"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NovelError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6">
      <h1 className="text-3xl font-bold mb-4">Failed to Load Novel</h1>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        We couldn't load this novel. The server might be temporarily unavailable.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} variant="secondary">
          Try Again
        </Button>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
