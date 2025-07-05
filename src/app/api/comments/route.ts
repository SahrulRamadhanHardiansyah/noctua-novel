import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { novelSlug, content } = await request.json();

    const comment = await prisma.comment.create({
      data: {
        novelSlug,
        content,
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
