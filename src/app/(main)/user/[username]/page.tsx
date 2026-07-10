import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PublicProfileClient from "@/components/PublicProfileClient";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await prisma.userProfile.findFirst({
    where: { displayName: { equals: username, mode: "insensitive" } },
  });
  if (!profile) return { title: "User Not Found | NoctuaNovel" };
  return {
    title: `${profile.displayName} — Level ${profile.level} | NoctuaNovel`,
    description: profile.bio || `View ${profile.displayName}'s profile on NoctuaNovel`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;

  const profile = await prisma.userProfile.findFirst({
    where: { displayName: { equals: username, mode: "insensitive" } },
  });

  if (!profile) notFound();

  const [achievements, novels, titles, unlockedBorders] = await Promise.all([
    prisma.userAchievement.findMany({
      where: { userId: profile.userId },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    }),
    prisma.userNovel.findMany({
      where: { userId: profile.userId },
      select: { id: true, title: true, slug: true, viewCount: true, status: true, _count: { select: { chapters: true } } },
      orderBy: { viewCount: "desc" },
      take: 6,
    }),
    prisma.userTitle.findMany({
      where: { userId: profile.userId },
      orderBy: { unlockedAt: "desc" },
    }),
    prisma.userBorder.findMany({
      where: { userId: profile.userId },
      include: { border: true },
    }),
  ]);

  // Count total chapters read
  const chaptersRead = await prisma.readingProgress.count({
    where: { userId: profile.userId, completed: true },
  });

  const serializedProfile = {
    userId: profile.userId,
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    xp: profile.xp,
    level: profile.level,
    equippedTitle: profile.equippedTitle,
    equippedBorder: profile.equippedBorder,
    totalEarnings: profile.totalEarnings,
    createdAt: profile.createdAt.toISOString(),
  };

  return (
    <PublicProfileClient
      profile={serializedProfile}
      achievements={achievements.map((ua) => ({
        key: ua.achievement.key,
        title: ua.achievement.title,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        unlockedAt: ua.unlockedAt.toISOString(),
      }))}
      novels={novels}
      titles={titles.map((t) => t.title)}
      unlockedBorders={unlockedBorders.map((ub) => ({
        key: ub.border.key,
        name: ub.border.name,
        cssClass: ub.border.cssClass,
        rarity: ub.border.rarity,
      }))}
      chaptersRead={chaptersRead}
    />
  );
}
