import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ponytail: shared ownership check — all 3 handlers need this
async function verifyChapterOwnership(chapterId: string, userId: string) {
  return prisma.userChapter.findFirst({
    where: {
      id: chapterId,
      novel: { userId },
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const chapterId = req.nextUrl.searchParams.get("chapterId");
    if (!chapterId) return NextResponse.json({ error: "chapterId is required" }, { status: 400 });

    const chapter = await verifyChapterOwnership(chapterId, userId);
    if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    const autoSave = await prisma.chapterAutoSave.findFirst({
      where: { chapterId },
      orderBy: { savedAt: "desc" },
    });

    return NextResponse.json(autoSave);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chapterId, content, title } = await req.json();
    if (!chapterId || !content) {
      return NextResponse.json({ error: "chapterId and content are required" }, { status: 400 });
    }

    const chapter = await verifyChapterOwnership(chapterId, userId);
    if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    const autoSave = await prisma.chapterAutoSave.create({
      data: { chapterId, content, title },
    });

    // ponytail: keep only last 5 — delete older ones in one query
    const saves = await prisma.chapterAutoSave.findMany({
      where: { chapterId },
      orderBy: { savedAt: "desc" },
      skip: 5,
      select: { id: true },
    });

    if (saves.length > 0) {
      await prisma.chapterAutoSave.deleteMany({
        where: { id: { in: saves.map((s) => s.id) } },
      });
    }

    return NextResponse.json({ success: true, savedAt: autoSave.savedAt });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chapterId, content, title, isDraft, isLocked, coinPrice, scheduledAt } = await req.json();
    if (!chapterId) return NextResponse.json({ error: "chapterId is required" }, { status: 400 });

    const chapter = await verifyChapterOwnership(chapterId, userId);
    if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    // ponytail: build update data only from provided fields
    const data: Record<string, unknown> = {};
    if (content !== undefined) {
      data.content = content;
      data.wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    }
    if (title !== undefined) data.title = title;
    if (isDraft !== undefined) data.isDraft = isDraft;
    if (isLocked !== undefined) data.isLocked = isLocked;
    if (coinPrice !== undefined) data.coinPrice = coinPrice;
    if (scheduledAt !== undefined) data.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;

    const updated = await prisma.userChapter.update({
      where: { id: chapterId },
      data,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
