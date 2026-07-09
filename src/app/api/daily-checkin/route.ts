import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const WEEK_REWARDS = [10, 15, 20, 25, 30, 40, 60];

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  );
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.userProfile.findUnique({ where: { userId } });

    const lastCheckIn = profile?.lastCheckIn ?? null;
    const canCheckIn = !lastCheckIn || !isToday(lastCheckIn);
    const currentStreak = profile?.checkInStreak ?? 0;
    // ponytail: next reward is streak-based index; if streak is 0 or reset, day 1 reward
    const nextDay = canCheckIn ? (lastCheckIn && isYesterday(lastCheckIn) ? Math.min(currentStreak, 6) : 0) : currentStreak - 1;
    const todayReward = WEEK_REWARDS[Math.max(0, Math.min(nextDay, 6))];

    return NextResponse.json({
      canCheckIn,
      currentStreak,
      lastCheckIn: lastCheckIn?.toISOString() ?? null,
      todayReward,
      weekRewards: WEEK_REWARDS,
    });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      create: { userId, displayName: "User", coinBalance: 0, checkInStreak: 0, totalEarnings: 0 },
      update: {},
    });

    if (profile.lastCheckIn && isToday(profile.lastCheckIn)) {
      return NextResponse.json({ error: "Already checked in today" }, { status: 400 });
    }

    const consecutive = profile.lastCheckIn && isYesterday(profile.lastCheckIn);
    const newStreak = consecutive
      ? profile.checkInStreak >= 7 ? 1 : profile.checkInStreak + 1
      : 1;

    const reward = WEEK_REWARDS[newStreak - 1];
    const newBalance = profile.coinBalance + reward;

    await prisma.$transaction([
      prisma.userProfile.update({
        where: { userId },
        data: { coinBalance: newBalance, checkInStreak: newStreak, lastCheckIn: new Date() },
      }),
      prisma.coinTransaction.create({
        data: { userId, amount: reward, type: "daily_checkin", description: `Day ${newStreak} check-in reward` },
      }),
      prisma.dailyCheckIn.create({
        data: { userId, day: newStreak, reward },
      }),
    ]);

    return NextResponse.json({ success: true, reward, newStreak, newBalance });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
