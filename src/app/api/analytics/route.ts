import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const novels = await prisma.userNovel.findMany({
      where: { userId },
      include: {
        chapters: { select: { viewCount: true } },
        reviews: { select: { rating: true } },
      },
    });

    // ponytail: single query per novel for favorites via slug list, O(novels) is fine for author dashboards
    const slugs = novels.map((n) => `community-${n.slug}`);
    const favCounts = await prisma.favorite.groupBy({
      by: ["novelSlug"],
      where: { novelSlug: { in: slugs } },
      _count: true,
    });
    const favMap = new Map(favCounts.map((f) => [f.novelSlug, f._count]));

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { totalEarnings: true },
    });

    let totalChapters = 0;
    let totalViews = 0;
    let totalFavorites = 0;
    let totalReviews = 0;
    let ratingSum = 0;

    const perNovel = novels.map((novel) => {
      const chapterViews = novel.chapters.reduce((s, c) => s + c.viewCount, 0);
      const novelViews = novel.viewCount + chapterViews;
      const favoriteCount = favMap.get(`community-${novel.slug}`) ?? 0;
      const ratings = novel.reviews.map((r) => r.rating);
      const avgRating = ratings.length > 0
        ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 100) / 100
        : 0;

      totalChapters += novel.chapters.length;
      totalViews += novelViews;
      totalFavorites += favoriteCount;
      totalReviews += ratings.length;
      ratingSum += ratings.reduce((s, r) => s + r, 0);

      return {
        novelId: novel.id,
        title: novel.title,
        viewCount: novelViews,
        chapterCount: novel.chapters.length,
        favoriteCount,
        avgRating,
      };
    });

    return NextResponse.json({
      overview: {
        totalNovels: novels.length,
        totalChapters,
        totalViews,
        totalFavorites,
        totalReviews,
        avgRating: totalReviews > 0
          ? Math.round((ratingSum / totalReviews) * 100) / 100
          : 0,
        totalEarnings: profile?.totalEarnings ?? 0,
      },
      novels: perNovel,
    });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
