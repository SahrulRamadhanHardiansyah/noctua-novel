import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const missions = await prisma.readingMission.findMany({
      where: { isActive: true },
    });

    const progressRecords = await prisma.readingMissionProgress.findMany({
      where: { userId, missionId: { in: missions.map((m) => m.id) } },
    });

    const progressMap = new Map(progressRecords.map((p) => [p.missionId, p]));

    const result = missions.map((mission) => {
      const progress = progressMap.get(mission.id);
      return {
        ...mission,
        progress: progress?.progress ?? 0,
        completed: progress?.completed ?? false,
        claimed: !!progress?.claimedAt,
      };
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { missionId } = await req.json();
    if (!missionId) return NextResponse.json({ error: "Missing missionId" }, { status: 400 });

    const mission = await prisma.readingMission.findUnique({ where: { id: missionId } });
    if (!mission || !mission.isActive) {
      return NextResponse.json({ error: "Mission not found or inactive" }, { status: 404 });
    }

    const progress = await prisma.readingMissionProgress.findFirst({
      where: { userId, missionId },
    });

    if (!progress || progress.progress < mission.target) {
      return NextResponse.json({ error: "Mission not completed yet" }, { status: 400 });
    }
    if (progress.claimedAt) {
      return NextResponse.json({ error: "Reward already claimed" }, { status: 400 });
    }

    // ponytail: single transaction covers claim + coin award atomically
    const [, , profile] = await prisma.$transaction([
      prisma.readingMissionProgress.update({
        where: { id: progress.id },
        data: { claimedAt: new Date() },
      }),
      prisma.coinTransaction.create({
        data: {
          userId,
          amount: mission.reward,
          type: "reading_mission",
          description: `Claimed reward for mission: ${mission.title}`,
        },
      }),
      prisma.userProfile.update({
        where: { userId },
        data: { coinBalance: { increment: mission.reward } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      reward: mission.reward,
      newBalance: profile.coinBalance,
    });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { missionType } = await req.json();
    if (!missionType || !["daily", "weekly"].includes(missionType)) {
      return NextResponse.json({ error: "Invalid missionType" }, { status: 400 });
    }

    const missions = await prisma.readingMission.findMany({
      where: { isActive: true, type: missionType },
    });

    if (!missions.length) return NextResponse.json({ progress: [] });

    const updated = await prisma.$transaction(
      missions.map((mission) =>
        prisma.readingMissionProgress.upsert({
          where: { userId_missionId: { userId, missionId: mission.id } },
          create: { userId, missionId: mission.id, progress: 1, completed: 1 >= mission.target },
          update: {
            progress: { increment: 1 },
            // ponytail: completed flag set via raw check below; Prisma can't reference target in update
          },
        })
      )
    );

    // Fix completed flags for any that just crossed the threshold
    const completionUpdates = updated
      .filter((p) => !p.completed)
      .map((p) => {
        const mission = missions.find((m) => m.id === p.missionId)!;
        if (p.progress >= mission.target) {
          return prisma.readingMissionProgress.update({
            where: { id: p.id },
            data: { completed: true },
          });
        }
        return null;
      })
      .filter(Boolean);

    if (completionUpdates.length) {
      await prisma.$transaction(completionUpdates as any);
    }

    // Re-fetch for accurate response
    const progress = await prisma.readingMissionProgress.findMany({
      where: { userId, missionId: { in: missions.map((m) => m.id) } },
    });

    return NextResponse.json({ progress });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
