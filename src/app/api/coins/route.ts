import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

async function getOrCreateProfile(userId: string, displayName?: string) {
  return prisma.userProfile.upsert({
    where: { userId },
    update: {},
    create: { userId, displayName: displayName || "User" },
  });
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await currentUser();
    const profile = await getOrCreateProfile(userId, user?.fullName || user?.username || undefined);

    const transactions = await prisma.coinTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ balance: profile.coinBalance, transactions });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chapterId } = await req.json();
    if (!chapterId) return NextResponse.json({ error: "chapterId required" }, { status: 400 });

    const chapter = await prisma.userChapter.findUnique({
      where: { id: chapterId },
      include: { novel: { select: { userId: true, title: true } } },
    });

    if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    if (!chapter.isLocked) return NextResponse.json({ error: "Chapter is not locked" }, { status: 400 });

    const user = await currentUser();
    const profile = await getOrCreateProfile(userId, user?.fullName || user?.username || undefined);

    if (profile.coinBalance < chapter.coinPrice) {
      return NextResponse.json({ error: "Insufficient coins" }, { status: 400 });
    }

    const authorEarning = Math.floor(chapter.coinPrice * 0.7);

    // ponytail: single $transaction for atomicity on money path
    await prisma.$transaction([
      // Deduct from reader
      prisma.userProfile.update({
        where: { userId },
        data: { coinBalance: { decrement: chapter.coinPrice } },
      }),
      prisma.coinTransaction.create({
        data: {
          userId,
          amount: -chapter.coinPrice,
          type: "chapter_unlock",
          description: `Unlocked chapter: ${chapter.title}`,
        },
      }),
      // Pay author (70%)
      prisma.userProfile.upsert({
        where: { userId: chapter.novel.userId },
        update: {
          coinBalance: { increment: authorEarning },
          totalEarnings: { increment: authorEarning },
        },
        create: {
          userId: chapter.novel.userId,
          displayName: "Author",
          coinBalance: authorEarning,
          totalEarnings: authorEarning,
        },
      }),
      prisma.coinTransaction.create({
        data: {
          userId: chapter.novel.userId,
          amount: authorEarning,
          type: "author_earning",
          description: `Earning from chapter: ${chapter.title}`,
        },
      }),
    ]);

    const newBalance = profile.coinBalance - chapter.coinPrice;

    return NextResponse.json({ success: true, newBalance });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
