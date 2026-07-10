import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// POST: update equipped title and/or border
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { equippedTitle, equippedBorder } = await req.json();

    // Validate border ownership if changing border
    if (equippedBorder && equippedBorder !== "none") {
      const border = await prisma.profileBorder.findUnique({ where: { key: equippedBorder } });
      if (!border) return NextResponse.json({ error: "Border not found" }, { status: 404 });

      const ownsBorder = await prisma.userBorder.findUnique({
        where: { userId_borderId: { userId, borderId: border.id } },
      });
      if (!ownsBorder) return NextResponse.json({ error: "Border not unlocked" }, { status: 403 });
    }

    // Validate title ownership if changing title
    if (equippedTitle) {
      const ownsTitle = await prisma.userTitle.findUnique({
        where: { userId_title: { userId, title: equippedTitle } },
      });
      if (!ownsTitle) return NextResponse.json({ error: "Title not unlocked" }, { status: 403 });
    }

    await prisma.userProfile.update({
      where: { userId },
      data: {
        ...(equippedTitle !== undefined && { equippedTitle }),
        ...(equippedBorder !== undefined && { equippedBorder }),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
