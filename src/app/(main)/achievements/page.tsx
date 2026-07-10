"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Trophy, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  reading: "Reading",
  social: "Social",
  streak: "Streak",
  author: "Author",
};

export default function AchievementsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
      return;
    }
    if (!user) return;

    fetch("/api/achievements")
      .then((r) => (r.ok ? r.json() : []))
      .then(setAchievements)
      .catch(() => toast.error("Failed to load achievements"))
      .finally(() => setLoading(false));
  }, [user, isLoaded, router]);

  if (!isLoaded || loading) {
    return (
      <div className="bg-[#09090b] text-white min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);
  const categories = [...new Set(achievements.map((a) => a.category))];

  return (
    <div className="bg-[#09090b] text-white min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-6 md:px-16 lg:px-36">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link href="/" className="text-zinc-500 hover:text-violet-400 transition">
            ← Back
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400" /> Achievements
            </h1>
            <p className="text-zinc-500 mt-1">
              {unlocked.length} of {achievements.length} unlocked
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-12 bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-400">Overall Progress</span>
            <span className="text-sm font-bold text-violet-400">
              {achievements.length > 0 ? Math.round((unlocked.length / achievements.length) * 100) : 0}%
            </span>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-500"
              style={{ width: `${achievements.length > 0 ? (unlocked.length / achievements.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* By Category */}
        {categories.map((cat) => {
          const catAchievements = achievements.filter((a) => a.category === cat);
          return (
            <div key={cat} className="mb-10">
              <h2 className="text-xl font-bold text-white mb-4">
                {CATEGORY_LABELS[cat] || cat}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catAchievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`bg-zinc-900/50 border rounded-xl p-5 transition-all duration-300 ${
                      ach.unlocked
                        ? "border-violet-500/30 shadow-lg shadow-violet-500/5"
                        : "border-white/[0.06] opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        ach.unlocked ? "bg-violet-500/20" : "bg-zinc-800/50"
                      }`}>
                        {ach.unlocked ? (
                          <Trophy className="w-6 h-6 text-amber-400" />
                        ) : (
                          <Lock className="w-5 h-5 text-zinc-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className={`font-semibold ${ach.unlocked ? "text-white" : "text-zinc-500"}`}>
                          {ach.title}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">{ach.description}</p>
                        {!ach.unlocked && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-zinc-600 mb-1">
                              <span>{ach.progress} / {ach.requirement}</span>
                              <span>{Math.round((ach.progress / ach.requirement) * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-violet-500/60 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((ach.progress / ach.requirement) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {ach.unlocked && ach.unlockedAt && (
                          <p className="text-[10px] text-zinc-600 mt-2">
                            Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
