import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { seedAchievements, unlockAchievement, checkTimeBasedAchievements } from "@/lib/utils/achievements";

// GET: list all achievements with user's progress
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure achievements exist in DB
    await seedAchievements();

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

    // Ensure achievements exist
    await seedAchievements();

    const { trigger } = await req.json();
    const unlocked: string[] = [];

    switch (trigger) {
      case "chapter_read": {
        // Increment reading achievements
        const firstStep = await unlockAchievement(userId, "first_step");
        if (firstStep) unlocked.push(firstStep);
        const marathon = await unlockAchievement(userId, "marathon_reader");
        if (marathon) unlocked.push(marathon);
        const bookworm = await unlockAchievement(userId, "bookworm");
        if (bookworm) unlocked.push(bookworm);
        // Time-based
        const timeBased = await checkTimeBasedAchievements(userId);
        unlocked.push(...timeBased);
        break;
      }
      case "review_posted": {
        const result = await unlockAchievement(userId, "first_review");
        if (result) unlocked.push(result);
        break;
      }
      case "comment_posted": {
        const result = await unlockAchievement(userId, "social_butterfly");
        if (result) unlocked.push(result);
        break;
      }
      case "quote_saved": {
        const result = await unlockAchievement(userId, "quote_collector");
        if (result) unlocked.push(result);
        break;
      }
      case "checkin_streak": {
        const result = await unlockAchievement(userId, "streak_7");
        if (result) unlocked.push(result);
        break;
      }
      case "novel_published": {
        const result = await unlockAchievement(userId, "author_debut");
        if (result) unlocked.push(result);
        break;
      }
    }

    // Show toast for unlocked achievements
    if (unlocked.length > 0) {
      return NextResponse.json({
        unlocked,
        message: `Achievement${unlocked.length > 1 ? "s" : ""} unlocked: ${unlocked.join(", ")}!`,
      });
    }

    return NextResponse.json({ unlocked: [] });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
