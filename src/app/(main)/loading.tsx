import { Loader2 } from "lucide-react";

export default function MainLoading() {
  return (
    <div className="bg-[#09090b] min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" />
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}
