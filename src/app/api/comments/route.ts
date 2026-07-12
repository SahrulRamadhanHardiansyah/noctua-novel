import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { sanitizeText, clampLength } from "@/lib/sanitize";

const MAX_COMMENT_LENGTH = 2000;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 10 comments per minute
    const rateLimit = checkRateLimit(`comment:${userId}`, RATE_LIMITS.create);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${rateLimit.retryAfter}s` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { novelSlug, content } = body;

    // Validate novelSlug
    if (!novelSlug || typeof novelSlug !== "string") {
      return NextResponse.json({ error: "novelSlug is required" }, { status: 400 });
    }

    // Validate content
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    // Sanitize + clamp
    const sanitizedContent = clampLength(sanitizeText(content), MAX_COMMENT_LENGTH);

    if (sanitizedContent.length === 0) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        novelSlug,
        content: sanitizedContent,
        userId,
        authorName: sanitizeText(user.firstName || user.username || "Anonymous"),
        authorImageUrl: user.imageUrl,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("POST COMMENT ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
