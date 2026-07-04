import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const slugify = (text: string) =>
  text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { novelId, title, content, orderIndex } = await request.json();

    if (!novelId || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify ownership
    const novel = await prisma.userNovel.findUnique({ where: { id: novelId } });
    if (!novel || novel.userId !== userId) {
      return NextResponse.json({ error: "Novel not found or unauthorized" }, { status: 403 });
    }

    const slug = `${novel.slug}-chapter-${orderIndex}-${slugify(title).substring(0, 20)}`;

    const chapter = await prisma.userChapter.create({
      data: {
        novelId,
        title: title.trim(),
        content: content.trim(),
        orderIndex: orderIndex || 0,
        slug
      }
    });

    // Create a notification for followers (In a real app you'd find followers, here we just show the structure)
    // # ponytail: skipping actual follower logic, just leaving the table ready.

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error("POST USER CHAPTER ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
