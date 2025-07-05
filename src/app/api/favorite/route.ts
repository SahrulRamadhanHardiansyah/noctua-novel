import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ isFavorited: false });
    }
    const { searchParams } = new URL(request.url);
    const novelSlug = searchParams.get("novelSlug");
    if (!novelSlug) {
      return NextResponse.json({ error: "novelSlug query parameter is required" }, { status: 400 });
    }
    const favorite = await prisma.favorite.findFirst({
      where: { userId, novelSlug },
    });
    return NextResponse.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error("GET FAVORITE STATUS ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { novelSlug } = await request.json();
    if (!novelSlug) {
      return NextResponse.json({ error: "novelSlug is required" }, { status: 400 });
    }

    const existingFavorite = await prisma.favorite.findFirst({
      where: { userId, novelSlug },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });
      return NextResponse.json({ message: "Removed from favorites", isFavorited: false });
    } else {
      await prisma.favorite.create({
        data: { userId, novelSlug },
      });
      return NextResponse.json({ message: "Added to favorites", isFavorited: true });
    }
  } catch (error) {
    console.error("POST FAVORITE ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
