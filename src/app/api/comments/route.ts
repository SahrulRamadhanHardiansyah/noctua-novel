import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const MAX_COMMENT_LENGTH = 2000;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { novelSlug, content } = body;

    // Validate novelSlug
    if (!novelSlug || typeof novelSlug !== "string") {
      return NextResponse.json({ error: "novelSlug is required" }, { status: 400 });
    }

    if (!SLUG_PATTERN.test(novelSlug)) {
      return NextResponse.json({ error: "Invalid novelSlug format" }, { status: 400 });
    }

    // Validate content
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    if (trimmedContent.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Comment must be ${MAX_COMMENT_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        novelSlug,
        content: trimmedContent,
        userId,
        authorName: user.firstName || user.username || "Anonymous",
        authorImageUrl: user.imageUrl,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("POST COMMENT ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
