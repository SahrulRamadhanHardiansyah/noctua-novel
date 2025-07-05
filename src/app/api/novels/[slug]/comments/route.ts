import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;

    const comments = await prisma.comment.findMany({
      where: {
        novelSlug: slug,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
