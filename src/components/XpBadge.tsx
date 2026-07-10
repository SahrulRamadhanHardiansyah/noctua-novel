"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { levelProgress } from "@/lib/gamification";

export default function XpBadge() {
  const { user } = useUser();
  const [level, setLevel] = useState<number | null>(null);
  const [xp, setXp] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/gamification/xp");
        if (res.ok) {
          const data = await res.json();
          setLevel(data.level);
          setXp(data.xp);
          setProgress(data.progress);
        }
      } catch {}
    };
    fetchData();
    // Refresh on level-up event
    const handler = () => fetchData();
    window.addEventListener("noctua-level-up" as any, handler);
    return () => window.removeEventListener("noctua-level-up" as any, handler);
  }, [user]);

  if (!user || level === null) return null;

  return (
    <Link
      href="/dashboard/customize"
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition text-violet-300 text-sm font-semibold"
      title={`Level ${level} — ${xp} XP (${progress}%)`}
    >
      <span className="text-xs">Lv.{level}</span>
      <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </Link>
  );
}
