import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { sanitizeText, clampLength } from "@/lib/sanitize";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const novelId = req.nextUrl.searchParams.get("novelId");
    if (!novelId) return NextResponse.json({ error: "novelId required" }, { status: 400 });

    const reviews = await prisma.review.findMany({
      where: { novelId },
      orderBy: { createdAt: "desc" },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
      : 0;

    return NextResponse.json({ reviews, averageRating, totalReviews });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit
    const rateLimit = checkRateLimit(`review:${userId}`, RATE_LIMITS.create);
    if (!rateLimit.success) {
      return NextResponse.json({ error: `Too many requests. Try again in ${rateLimit.retryAfter}s` }, { status: 429 });
    }

    const { novelId, rating, title, content } = await req.json();
    if (!novelId || !rating || rating < 1 || rating > 5)
      return NextResponse.json({ error: "novelId and rating (1-5) required" }, { status: 400 });

    // Sanitize text fields
    const sanitizedTitle = title ? clampLength(sanitizeText(title), 200) : null;
    const sanitizedContent = content ? clampLength(sanitizeText(content), 2000) : "";

    const user = await currentUser();
    const authorName = user?.fullName || user?.username || "Anonymous";
    const authorImageUrl = user?.imageUrl || "";

    const review = await prisma.review.upsert({
      where: { userId_novelId: { userId, novelId } },
      update: { rating, title: sanitizedTitle, content: sanitizedContent, authorName, authorImageUrl },
      create: { userId, novelId, rating, title: sanitizedTitle, content: sanitizedContent, authorName, authorImageUrl },
    });

    // Notify novel author
    const novel = await prisma.userNovel.findUnique({ where: { id: novelId }, select: { userId: true, title: true } });
    if (novel && novel.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: novel.userId,
          type: "comment_reply",
          title: "New Review",
          message: `${authorName} left a ${rating}-star review on "${novel.title}".`,
          isRead: false,
          link: `/novel/community-${novelId}`,
        },
      });
    }

    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { novelId } = await req.json();
    if (!novelId) return NextResponse.json({ error: "novelId required" }, { status: 400 });

    await prisma.review.deleteMany({ where: { userId, novelId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
