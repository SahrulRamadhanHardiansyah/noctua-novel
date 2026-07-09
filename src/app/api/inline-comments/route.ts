import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json({ error: "chapterId is required" }, { status: 400 });
    }

    const comments = await prisma.inlineComment.findMany({
      where: { chapterId },
      orderBy: { createdAt: "asc" },
    });

    // ponytail: group in JS, single query beats N queries per paragraph
    const grouped: Record<number, typeof comments> = {};
    for (const c of comments) {
      (grouped[c.paragraphIndex] ??= []).push(c);
    }

    return NextResponse.json(grouped);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chapterId, paragraphIndex, content } = await req.json();

    if (!chapterId || paragraphIndex == null || !content?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await currentUser();

    const comment = await prisma.inlineComment.create({
      data: {
        userId,
        authorName: user?.firstName ?? user?.username ?? "Anonymous",
        authorImageUrl: user?.imageUrl ?? "",
        chapterId,
        paragraphIndex,
        content: content.trim(),
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Comment id is required" }, { status: 400 });
    }

    const comment = await prisma.inlineComment.findUnique({ where: { id } });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.inlineComment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
