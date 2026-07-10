import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ACHIEVEMENT_DEFS } from "@/lib/achievements";

// GET: list all achievements with user's progress
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure achievements exist in DB
    for (const def of ACHIEVEMENT_DEFS) {
      await prisma.achievement.upsert({
        where: { key: def.key },
        update: {},
        create: { key: def.key, title: def.title, description: def.description, icon: def.icon, category: def.category, requirement: def.requirement },
      });
    }

    const achievements = await prisma.achievement.findMany();
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
    });

    const userMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));

    const result = achievements.map((a) => {
      const ua = userMap.get(a.id);
      return {
        id: a.id,
        key: a.key,
        title: a.title,
        description: a.description,
        icon: a.icon,
        category: a.category,
        requirement: a.requirement,
        progress: ua?.progress ?? 0,
        unlocked: ua ? ua.progress >= a.requirement : false,
        unlockedAt: ua?.unlockedAt ?? null,
      };
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: check and unlock achievements based on trigger
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { trigger, value } = await req.json();
    // trigger: "chapter_read" | "review_posted" | "comment_posted" | "checkin_streak" | "coins_earned" | "novel_published"

    const achievements = await prisma.achievement.findMany({
      where: { category: trigger === "chapter_read" ? "reading" : trigger === "review_posted" || trigger === "comment_posted" ? "social" : trigger === "checkin_streak" ? "streak" : "author" },
    });

    const unlocked: string[] = [];

    for (const ach of achievements) {
      const ua = await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: ach.id } },
        update: { progress: { increment: value ?? 1 } },
        create: { userId, achievementId: ach.id, progress: value ?? 1 },
      });

      if (ua.progress >= ach.requirement) {
        unlocked.push(ach.title);
      }
    }

    // Check special time-based achievements
    const hour = new Date().getHours();
    if (trigger === "chapter_read") {
      if (hour >= 0 && hour < 6) {
        const earlyBird = achievements.find((a) => a.key === "early_bird");
        if (earlyBird) {
          await prisma.userAchievement.upsert({
            where: { userId_achievementId: { userId, achievementId: earlyBird.id } },
            update: { progress: { increment: 1 } },
            create: { userId, achievementId: earlyBird.id, progress: 1 },
          });
          unlocked.push(earlyBird.title);
        }
      }
      if (hour >= 0 && hour < 5) {
        const nightOwl = achievements.find((a) => a.key === "night_owl");
        if (nightOwl) {
          await prisma.userAchievement.upsert({
            where: { userId_achievementId: { userId, achievementId: nightOwl.id } },
            update: { progress: { increment: 1 } },
            create: { userId, achievementId: nightOwl.id, progress: 1 },
          });
          unlocked.push(nightOwl.title);
        }
      }
    }

    return NextResponse.json({ unlocked });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
