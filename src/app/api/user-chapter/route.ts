import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils/slug";
import { sanitizeText, clampLength } from "@/lib/sanitize";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit
    const rateLimit = checkRateLimit(`chapter:${userId}`, RATE_LIMITS.create);
    if (!rateLimit.success) {
      return NextResponse.json({ error: `Too many requests. Try again in ${rateLimit.retryAfter}s` }, { status: 429 });
    }

    const { novelId, title, content, orderIndex, isDraft, isLocked, coinPrice, scheduledAt } = await request.json();

    if (!novelId || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify ownership
    const novel = await prisma.userNovel.findUnique({ where: { id: novelId } });
    if (!novel || novel.userId !== userId) {
      return NextResponse.json({ error: "Novel not found or unauthorized" }, { status: 403 });
    }

    // Sanitize title (plain text), content kept as-is since it's Markdown rendered by react-markdown
    const sanitizedTitle = clampLength(sanitizeText(title), 300);
    const trimmedContent = content.trim();

    const slug = `${novel.slug}-chapter-${orderIndex}-${slugify(sanitizedTitle).substring(0, 20)}`;

    const chapter = await prisma.userChapter.create({
      data: {
        novelId,
        title: sanitizedTitle,
        content: trimmedContent,
        orderIndex: orderIndex || 0,
        slug,
        wordCount: trimmedContent.split(/\s+/).filter(Boolean).length,
        isDraft: isDraft ?? false,
        isLocked: isLocked ?? false,
        coinPrice: coinPrice ?? 0,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
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
