"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-zinc-900 border border-white/[0.08] rounded-xl p-4 shadow-2xl max-w-sm">
      <div className="flex items-start gap-3">
        <div className="bg-violet-500/10 rounded-lg p-2 flex-shrink-0">
          <Download className="w-5 h-5 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white">Install Noctua Novel</h4>
          <p className="text-xs text-zinc-500 mt-1">Add to home screen for a faster, offline reading experience.</p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleInstall}>Install</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowPrompt(false)}>Later</Button>
          </div>
        </div>
        <button onClick={() => setShowPrompt(false)} className="text-zinc-500 hover:text-white cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
