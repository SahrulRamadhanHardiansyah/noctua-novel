"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Trophy, BookOpen, Star, Calendar, ArrowLeft } from "lucide-react";
import { xpForLevel, levelProgress, BORDER_DEFS } from "@/lib/gamification";

interface ProfileData {
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
  equippedTitle: string | null;
  equippedBorder: string | null;
  totalEarnings: number;
  createdAt: string;
}

interface Props {
  profile: ProfileData;
  achievements: { key: string; title: string; description: string; icon: string; unlockedAt: string }[];
  novels: { id: string; title: string; slug: string; viewCount: number; status: string; _count: { chapters: number } }[];
  titles: string[];
  unlockedBorders: { key: string; name: string; cssClass: string; rarity: string }[];
  chaptersRead: number;
}

function getAvatarBorder(borderKey: string | null, level: number): string {
  if (borderKey && borderKey !== "none") {
    const border = BORDER_DEFS.find((b) => b.key === borderKey);
    if (border) return border.cssClass;
  }
  if (level >= 50) return BORDER_DEFS.find(b => b.key === "diamond_crown")!.cssClass;
  if (level >= 35) return BORDER_DEFS.find(b => b.key === "violet_aura")!.cssClass;
  if (level >= 20) return BORDER_DEFS.find(b => b.key === "golden_glow")!.cssClass;
  if (level >= 10) return BORDER_DEFS.find(b => b.key === "silver_frame")!.cssClass;
  if (level >= 5) return BORDER_DEFS.find(b => b.key === "bronze_frame")!.cssClass;
  return "";
}

export default function PublicProfileClient({
  profile,
  achievements,
  novels,
  titles,
  unlockedBorders,
  chaptersRead,
}: Props) {
  const progress = levelProgress(profile.xp, profile.level);
  const borderClasses = getAvatarBorder(profile.equippedBorder, profile.level);

  return (
    <div className="bg-[#09090b] text-white min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-6 md:px-16 lg:px-36">
        <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-violet-400 mb-8 transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Link>

        {/* Profile Header */}
        <div className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-8 mb-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className={`relative w-28 h-28 rounded-full flex-shrink-0 ${borderClasses}`}>
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  width={112}
                  height={112}
                  className="rounded-full absolute inset-1"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-3xl font-bold">
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Level badge */}
              <span className="absolute -bottom-1 -right-1 bg-violet-600 text-white text-sm font-bold px-2.5 py-1 rounded-full border-3 border-[#09090b]">
                {profile.level}
              </span>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-1">
                <h1 className="text-3xl font-bold text-white">{profile.displayName}</h1>
                {profile.equippedTitle && (
                  <span className="text-sm font-medium text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full">
                    {profile.equippedTitle}
                  </span>
                )}
              </div>

              {profile.bio && <p className="text-zinc-400 mb-4">{profile.bio}</p>}

              {/* XP Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                  <span>Level {profile.level}</span>
                  <span>{profile.xp.toLocaleString()} XP · {progress}% to Level {profile.level + 1}</span>
                </div>
                <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{chaptersRead}</p>
                  <p className="text-xs text-zinc-500">Chapters Read</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{achievements.length}</p>
                  <p className="text-xs text-zinc-500">Achievements</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{novels.length}</p>
                  <p className="text-xs text-zinc-500">Novels Published</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-amber-400">{profile.totalEarnings.toLocaleString()} 🪙</p>
                  <p className="text-xs text-zinc-500">Total Earnings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Achievements
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {achievements.map((ach) => (
                <div key={ach.key} className="bg-zinc-900/50 border border-white/[0.06] rounded-xl p-4 text-center">
                  <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-white">{ach.title}</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">{ach.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Published Novels */}
        {novels.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-400" /> Published Novels
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {novels.map((novel) => (
                <Link key={novel.id} href={`/novel/community-${novel.slug}`} className="bg-zinc-900/50 border border-white/[0.06] rounded-xl p-5 hover:border-violet-500/20 transition-all duration-300">
                  <h3 className="font-semibold text-white mb-1">{novel.title}</h3>
                  <p className="text-xs text-zinc-500">
                    {novel._count.chapters} chapters · {novel.viewCount.toLocaleString()} views · {novel.status}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Titles */}
        {titles.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" /> Unlocked Titles
            </h2>
            <div className="flex flex-wrap gap-2">
              {titles.map((title) => (
                <span key={title} className="bg-amber-400/10 border border-amber-400/20 text-amber-300 px-3 py-1.5 rounded-lg text-sm font-medium">
                  {title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
