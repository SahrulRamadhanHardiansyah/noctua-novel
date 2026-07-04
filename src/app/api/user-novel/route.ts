import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getSlugFromUrl } from "@/lib/utils/slug"; // Re-using our logic or we make a real slug generator

// Simple slug generator
const slugify = (text: string) =>
  text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text

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

    // Generate unique slug by appending random string if needed
    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = "novel";

    // Add random suffix to ensure uniqueness
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
