import { NextResponse } from "next/server";
import { getNovelResponse } from "@/lib/api-libs";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const [apiResults, communityResults] = await Promise.all([
      getNovelResponse("search", `q=${encodeURIComponent(q)}`).catch(() => []),
      prisma.userNovel.findMany({
        where: {
          title: { contains: q, mode: "insensitive" },
        },
        take: 10,
        include: {
          chapters: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { title: true, slug: true },
          },
        },
      }),
    ]);

    // Transform community novels to match API format
    const communityNovels = communityResults.map((novel) => ({
      url: `https://noctua-novel.com/novel/community-${novel.slug}`,
      title: novel.title,
      image_url: novel.imageUrl || "",
      genres: novel.genres,
      latest_chapters: novel.chapters.map((c) => ({
        title: c.title,
        slug: `community-${c.slug}`,
        url: `https://noctua-novel.com/chapter/community-${c.slug}`,
      })),
      isCommunity: true,
    }));

    // Merge: community novels first, then API results
    const merged = [...communityNovels, ...(Array.isArray(apiResults) ? apiResults : [])];
    return NextResponse.json(merged);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 });
  }
}
