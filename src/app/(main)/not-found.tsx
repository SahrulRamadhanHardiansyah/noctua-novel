import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookX } from "lucide-react";

export default function MainNotFound() {
  return (
    <div className="bg-[#09090b] min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="bg-violet-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BookX className="w-8 h-8 text-violet-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-zinc-500 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
