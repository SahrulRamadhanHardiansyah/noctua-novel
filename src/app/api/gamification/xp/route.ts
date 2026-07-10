import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { awardXp, XP_REWARDS } from "@/lib/gamification";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { trigger } = await req.json();
    const xpAmount = XP_REWARDS[trigger as keyof typeof XP_REWARDS];

    if (!xpAmount) {
      return NextResponse.json({ error: "Invalid trigger" }, { status: 400 });
    }

    const result = await awardXp(userId, xpAmount, trigger);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET: return user's current level, XP, and progress
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = (await import("@/lib/prisma")).default;
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {},
      create: { userId, displayName: "User" },
    });

    const { xpForLevel, levelProgress, BORDER_DEFS } = await import("@/lib/gamification");

    const unlockedBorders = await prisma.userBorder.findMany({
      where: { userId },
      include: { border: true },
    });

    return NextResponse.json({
      xp: profile.xp,
      level: profile.level,
      xpToNextLevel: xpForLevel(profile.level + 1) - profile.xp,
      progress: levelProgress(profile.xp, profile.level),
      equippedTitle: profile.equippedTitle,
      equippedBorder: profile.equippedBorder,
      unlockedBorders: unlockedBorders.map((ub) => ({
        key: ub.border.key,
        name: ub.border.name,
        cssClass: ub.border.cssClass,
        rarity: ub.border.rarity,
      })),
      allBorders: BORDER_DEFS.map((b) => ({
        key: b.key,
        name: b.name,
        cssClass: b.cssClass,
        requiredLvl: b.requiredLvl,
        rarity: b.rarity,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
