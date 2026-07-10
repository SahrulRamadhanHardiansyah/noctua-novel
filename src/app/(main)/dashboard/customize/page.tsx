"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, Lock, Loader2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BORDER_DEFS, xpForLevel, levelProgress } from "@/lib/gamification";

interface ProfileData {
  xp: number;
  level: number;
  equippedTitle: string | null;
  equippedBorder: string;
  unlockedBorders: { key: string; name: string; cssClass: string; rarity: string }[];
  allBorders: { key: string; name: string; cssClass: string; requiredLvl: number; rarity: string }[];
}

interface UserTitle {
  title: string;
  source: string;
  unlockedAt: string;
}

export default function CustomizePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [titles, setTitles] = useState<UserTitle[]>([]);
  const [selectedBorder, setSelectedBorder] = useState("none");
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [xpRes, titlesRes] = await Promise.all([
        fetch("/api/gamification/xp"),
        fetch("/api/gamification/titles"),
      ]);
      if (xpRes.ok) {
        const data = await xpRes.json();
        setProfile(data);
        setSelectedBorder(data.equippedBorder || "none");
        setSelectedTitle(data.equippedTitle || null);
      }
      if (titlesRes.ok) {
        const data = await titlesRes.json();
        setTitles(data);
      }
    } catch {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !user) { router.push("/"); return; }
    if (user) fetchData();
  }, [user, isLoaded, router, fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/gamification/customize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equippedBorder: selectedBorder, equippedTitle: selectedTitle }),
      });
      if (res.ok) {
        toast.success("Profile updated!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="bg-[#09090b] text-white min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const unlockedKeys = new Set(profile?.unlockedBorders.map(b => b.key) || []);

  return (
    <div className="bg-[#09090b] text-white min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6 md:px-16 lg:px-36">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-zinc-500 hover:text-violet-400 mb-8 transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-10">
          <Palette className="w-8 h-8 text-violet-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Customize Profile</h1>
            <p className="text-zinc-500">Change your equipped title and avatar border</p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-8 mb-10 flex flex-col items-center">
          <p className="text-xs text-zinc-500 mb-4 uppercase tracking-wider">Preview</p>
          <div className={`relative w-24 h-24 rounded-full ${selectedBorder !== "none" ? (BORDER_DEFS.find(b => b.key === selectedBorder)?.cssClass || "") : ""}`}>
            {user?.imageUrl ? (
              <Image src={user.imageUrl} alt="" width={96} height={96} className="rounded-full absolute inset-1" />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-2xl font-bold">
                {user?.firstName?.charAt(0) || "?"}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 bg-violet-600 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-[#09090b]">
              {profile?.level || 1}
            </span>
          </div>
          <p className="text-lg font-semibold text-white mt-4">{user?.fullName || user?.username}</p>
          {selectedTitle && (
            <span className="text-sm text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full mt-1">
              {selectedTitle}
            </span>
          )}
        </div>

        {/* Border Selection */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">Avatar Border</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {BORDER_DEFS.map((border) => {
              const isUnlocked = border.key === "none" || unlockedKeys.has(border.key);
              const isSelected = selectedBorder === border.key;

              return (
                <button
                  key={border.key}
                  onClick={() => isUnlocked && setSelectedBorder(border.key)}
                  disabled={!isUnlocked}
                  className={`relative bg-zinc-900/50 border rounded-xl p-5 text-center transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                    isSelected
                      ? "border-violet-500 shadow-lg shadow-violet-500/10"
                      : "border-white/[0.06] hover:border-white/[0.12]"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-violet-600 rounded-full p-1">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {!isUnlocked && (
                    <div className="absolute top-2 right-2 text-zinc-600">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}

                  {/* Mini avatar preview */}
                  <div className={`w-12 h-12 rounded-full mx-auto mb-3 ${border.key !== "none" ? border.cssClass : "ring-1 ring-white/10"}`}>
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-600/50 to-purple-700/50 m-0.5" />
                  </div>

                  <h3 className="text-sm font-semibold text-white">{border.name}</h3>
                  {!isUnlocked && (
                    <p className="text-[10px] text-zinc-600 mt-1">Level {border.requiredLvl}</p>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full mt-1 inline-block ${
                    border.rarity === "legendary" ? "bg-cyan-400/10 text-cyan-300" :
                    border.rarity === "epic" ? "bg-violet-400/10 text-violet-300" :
                    border.rarity === "rare" ? "bg-blue-400/10 text-blue-300" :
                    "bg-zinc-400/10 text-zinc-400"
                  }`}>
                    {border.rarity}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title Selection */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">Equipped Title</h2>
          {titles.length === 0 ? (
            <p className="text-zinc-500 text-sm">No titles unlocked yet. Complete achievements to earn titles!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* No title option */}
              <button
                onClick={() => setSelectedTitle(null)}
                className={`bg-zinc-900/50 border rounded-xl p-4 text-left transition-all duration-300 cursor-pointer ${
                  selectedTitle === null
                    ? "border-violet-500 shadow-lg shadow-violet-500/10"
                    : "border-white/[0.06] hover:border-white/[0.12]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400 italic">No title</span>
                  {selectedTitle === null && <Check className="w-4 h-4 text-violet-400" />}
                </div>
              </button>

              {titles.map((t) => (
                <button
                  key={t.title}
                  onClick={() => setSelectedTitle(t.title)}
                  className={`bg-zinc-900/50 border rounded-xl p-4 text-left transition-all duration-300 cursor-pointer ${
                    selectedTitle === t.title
                      ? "border-amber-400/50 shadow-lg shadow-amber-400/10"
                      : "border-white/[0.06] hover:border-white/[0.12]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-amber-300">{t.title}</span>
                    {selectedTitle === t.title && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-1">From: {t.source}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2 px-8">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
