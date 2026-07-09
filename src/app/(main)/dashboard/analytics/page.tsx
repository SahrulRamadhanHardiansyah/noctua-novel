import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  BookOpen,
  Book,
  Eye,
  Coins,
  Star,
  Users,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [novels, totalChapters, totalViews, profile] = await Promise.all([
    prisma.userNovel.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { chapters: true, reviews: true } },
        reviews: { select: { rating: true } },
      },
    }),
    prisma.userChapter.count({ where: { novel: { userId } } }),
    prisma.userNovel.aggregate({
      where: { userId },
      _sum: { viewCount: true },
    }),
    prisma.userProfile.findUnique({
      where: { userId },
      select: { totalEarnings: true },
    }),
  ]);

  // ponytail: favorites use novelSlug not novelId, batch lookup by slugs
  const slugs = novels.map((n) => n.slug);
  const favCounts = await prisma.favorite.groupBy({
    by: ["novelSlug"],
    where: { novelSlug: { in: slugs } },
    _count: true,
  });
  const favMap = Object.fromEntries(
    favCounts.map((f) => [f.novelSlug, f._count])
  );

  const views = totalViews._sum.viewCount ?? 0;
  const earnings = profile?.totalEarnings ?? 0;
  const totalFavs = Object.values(favMap).reduce((a, b) => a + b, 0);

  const stats = [
    { label: "Total Novels", value: novels.length, icon: BookOpen },
    { label: "Total Chapters", value: totalChapters, icon: Book },
    { label: "Total Views", value: views.toLocaleString(), icon: Eye },
    { label: "Favorites", value: totalFavs, icon: Users },
    { label: "Total Earnings", value: `${earnings.toLocaleString()} 🪙`, icon: Coins },
  ];

  return (
    <div className="bg-gray-950 text-white min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6 md:px-16 lg:px-36">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Analytics
            </h1>
            <p className="text-gray-400">
              Detailed performance breakdown of your novels.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6"
            >
              <div className="bg-gray-800 rounded-lg p-3 w-fit mb-3">
                <s.icon className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Per-novel table */}
        <h2 className="text-xl font-bold text-white mb-6">
          Per-Novel Performance
        </h2>

        {novels.length === 0 ? (
          <p className="text-gray-500">No novels to analyze yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800 text-sm text-gray-400">
                  <th className="p-4 font-medium">Novel</th>
                  <th className="p-4 font-medium text-center">Chapters</th>
                  <th className="p-4 font-medium text-center">Views</th>
                  <th className="p-4 font-medium text-center">Favorites</th>
                  <th className="p-4 font-medium text-center">Avg Rating</th>
                  <th className="p-4 font-medium text-center">Reviews</th>
                </tr>
              </thead>
              <tbody>
                {novels.map((novel) => {
                  const avgRating =
                    novel.reviews.length > 0
                      ? (
                          novel.reviews.reduce((s, r) => s + r.rating, 0) /
                          novel.reviews.length
                        ).toFixed(1)
                      : "—";

                  return (
                    <tr
                      key={novel.id}
                      className="border-b border-gray-800/50 bg-gray-900 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-4">
                        <Link
                          href={`/dashboard/novel/${novel.id}`}
                          className="font-medium text-white hover:text-primary transition-colors"
                        >
                          {novel.title}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {novel.status}
                        </p>
                      </td>
                      <td className="p-4 text-center text-gray-300">
                        {novel._count.chapters}
                      </td>
                      <td className="p-4 text-center text-gray-300">
                        {novel.viewCount.toLocaleString()}
                      </td>
                      <td className="p-4 text-center text-gray-300">
                        {favMap[novel.slug] ?? 0}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 text-gray-300">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          {avgRating}
                        </span>
                      </td>
                      <td className="p-4 text-center text-gray-300">
                        {novel._count.reviews}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
