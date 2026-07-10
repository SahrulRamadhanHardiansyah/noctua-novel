import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET: list all titles for the current user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const titles = await prisma.userTitle.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" },
    });

    return NextResponse.json(titles.map((t) => ({
      title: t.title,
      source: t.source,
      unlockedAt: t.unlockedAt.toISOString(),
    })));
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
