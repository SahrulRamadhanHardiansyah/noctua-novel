import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Shield, BookOpen, Users, MessageSquare, Star, Coins, BarChart3 } from "lucide-react";

export default async function AdminPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role = (sessionClaims?.metadata as any)?.role;
  if (role !== "ADMIN") redirect("/");

  // Gather platform stats
  const [
    totalNovels,
    totalChapters,
    totalUsers,
    totalComments,
    totalReviews,
    recentNovels,
  ] = await Promise.all([
    prisma.userNovel.count(),
    prisma.userChapter.count(),
    prisma.userProfile.count(),
    prisma.comment.count(),
    prisma.review.count(),
    prisma.userNovel.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        _count: { select: { chapters: true, reviews: true } },
      },
    }),
  ]);

  const totalCoins = await prisma.userProfile.aggregate({
    _sum: { coinBalance: true, totalEarnings: true },
  });

  const stats = [
    { label: "Total Novels", value: totalNovels, icon: BookOpen },
    { label: "Total Chapters", value: totalChapters, icon: BookOpen },
    { label: "Registered Users", value: totalUsers, icon: Users },
    { label: "Total Comments", value: totalComments, icon: MessageSquare },
    { label: "Total Reviews", value: totalReviews, icon: Star },
    { label: "Coins in Circulation", value: (totalCoins._sum.coinBalance ?? 0).toLocaleString(), icon: Coins },
  ];

  return (
    <div className="bg-[#09090b] text-white min-h-screen pt-20 sm:pt-24 pb-10 sm:pb-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-16 lg:px-36">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 md:mb-10">
          <div className="bg-red-500/10 rounded-xl p-2.5">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-zinc-500">Platform overview and management</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 md:mb-12">
          {stats.map((s) => (
            <div key={s.label} className="bg-zinc-900/50 border border-white/[0.06] rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-red-500/20 transition-all duration-300">
              <div className="bg-red-500/10 rounded-lg p-2.5 w-fit mb-3">
                <s.icon className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs sm:text-sm text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Novels Table */}
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-red-400" /> Recent Community Novels
        </h2>

        {recentNovels.length === 0 ? (
          <p className="text-zinc-500">No community novels yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs sm:text-sm text-zinc-500">
                  <th className="p-3 sm:p-4 font-medium">Title</th>
                  <th className="p-3 sm:p-4 font-medium text-center hidden sm:table-cell">Chapters</th>
                  <th className="p-3 sm:p-4 font-medium text-center hidden sm:table-cell">Reviews</th>
                  <th className="p-3 sm:p-4 font-medium text-center">Views</th>
                  <th className="p-3 sm:p-4 font-medium text-center hidden md:table-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentNovels.map((novel) => (
                  <tr key={novel.id} className="border-b border-white/[0.04] bg-zinc-900/30 hover:bg-white/[0.03] transition-colors">
                    <td className="p-3 sm:p-4">
                      <Link href={`/novel/community-${novel.slug}`} className="font-medium text-white hover:text-red-400 transition-colors">
                        {novel.title}
                      </Link>
                      <p className="text-[10px] text-zinc-600 mt-0.5">by {novel.authorName}</p>
                    </td>
                    <td className="p-3 sm:p-4 text-center text-zinc-300 hidden sm:table-cell">{novel._count.chapters}</td>
                    <td className="p-3 sm:p-4 text-center text-zinc-300 hidden sm:table-cell">{novel._count.reviews}</td>
                    <td className="p-3 sm:p-4 text-center text-zinc-300">{novel.viewCount.toLocaleString()}</td>
                    <td className="p-3 sm:p-4 text-center hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${novel.status === "Ongoing" ? "bg-green-500/10 text-green-400" : "bg-zinc-500/10 text-zinc-400"}`}>
                        {novel.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
