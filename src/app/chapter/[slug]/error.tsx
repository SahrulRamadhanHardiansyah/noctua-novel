"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ChapterError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white px-6">
      <h1 className="text-3xl font-bold mb-4">Failed to Load Chapter</h1>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        We couldn't load this chapter. Please try again later.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} variant="secondary">
          Try Again
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    </div>
  );
}
