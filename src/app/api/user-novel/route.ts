import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const slugify = (text: string) =>
  text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, synopsis, imageUrl, genres } = await request.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = "novel";

    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

    const novel = await prisma.userNovel.create({
      data: {
        userId,
        authorName: user.firstName || user.username || "Anonymous",
        slug,
        title: title.trim(),
        synopsis: synopsis?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        genres: Array.isArray(genres) ? genres : [],
      },
    });

    return NextResponse.json(novel, { status: 201 });
  } catch (error) {
    console.error("POST USER NOVEL ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, synopsis, imageUrl, genres } = await request.json();

    if (!id || !title || typeof title !== "string") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify ownership
    const existingNovel = await prisma.userNovel.findUnique({ where: { id } });
    if (!existingNovel || existingNovel.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized or not found" }, { status: 403 });
    }

    const novel = await prisma.userNovel.update({
      where: { id },
      data: {
        title: title.trim(),
        synopsis: synopsis?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        genres: Array.isArray(genres) ? genres : [],
      },
    });

    return NextResponse.json(novel, { status: 200 });
  } catch (error) {
    console.error("PUT USER NOVEL ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
