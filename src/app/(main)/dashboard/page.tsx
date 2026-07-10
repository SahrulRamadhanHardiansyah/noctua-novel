import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle,
  Book,
  BookOpen,
  Eye,
  Coins,
  Edit,
  BarChart3,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  const [myNovels, totalChapters, totalViews, profile] = await Promise.all([
    prisma.userNovel.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { chapters: true } } },
    }),
    prisma.userChapter.count({
      where: { novel: { userId } },
    }),
    prisma.userNovel.aggregate({
      where: { userId },
      _sum: { viewCount: true },
    }),
    prisma.userProfile.findUnique({
      where: { userId },
      select: { totalEarnings: true },
    }),
  ]);

  const totalNovels = myNovels.length;
  const views = totalViews._sum.viewCount ?? 0;
  const earnings = profile?.totalEarnings ?? 0;

  const stats = [
    { label: "Total Novels", value: totalNovels, icon: BookOpen },
    { label: "Total Chapters", value: totalChapters, icon: Book },
    { label: "Total Views", value: views.toLocaleString(), icon: Eye },
    { label: "Total Earnings", value: `${earnings.toLocaleString()} 🪙`, icon: Coins },
  ];

  return (
    <div className="bg-[#09090b] text-white min-h-screen pt-20 sm:pt-24 pb-10 sm:pb-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-16 lg:px-36">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome back, {user?.firstName || "Author"} ✨
            </h1>
            <p className="text-sm sm:text-base text-zinc-500">
              Manage your novels, track performance, and grow your readership.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link href="/dashboard/analytics">
              <Button variant="secondary" size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Analytics
              </Button>
            </Link>
            <Link href="/dashboard/customize">
              <Button variant="secondary" size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
                <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Customize
              </Button>
            </Link>
            <Link href="/dashboard/create-novel">
              <Button size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
                <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Create Novel
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-6 flex items-center gap-4 hover:border-violet-500/20 transition-all duration-300"
            >
              <div className="bg-violet-500/10 rounded-xl p-3">
                <s.icon className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-zinc-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* My Novels */}
        <h2 className="text-xl font-bold text-white mb-6">My Novels</h2>

        {myNovels.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-white/[0.06] shadow-xl">
            <div className="bg-zinc-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Book className="w-10 h-10 text-zinc-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              No novels yet
            </h2>
            <p className="text-zinc-500 mb-8 max-w-md mx-auto">
              Start your journey as an author. Write your first original novel
              and share it with the NoctuaNovel community!
            </p>
            <Link href="/dashboard/create-novel">
              <Button size="lg" className="px-8 font-medium">
                Start Writing
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myNovels.map((novel) => (
              <div
                key={novel.id}
                className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl overflow-hidden hover:border-violet-500/20 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 flex flex-col group"
              >
                {/* Cover */}
                <div className="h-32 bg-zinc-800/50 relative w-full overflow-hidden">
                  {novel.imageUrl ? (
                    <Image
                      src={`/api/proxy-image?url=${encodeURIComponent(novel.imageUrl)}`}
                      alt={novel.title}
                      fill
                      className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900" />
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge
                      variant={novel.status === "Ongoing" ? "default" : "secondary"}
                      className="text-[10px] uppercase tracking-wider font-bold"
                    >
                      {novel.status}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                    {novel.title}
                  </h3>

                  {/* Genre tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {novel.genres.slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 bg-violet-500/10 text-violet-300 border-0 rounded text-[10px] font-medium tracking-wide"
                      >
                        {g}
                      </span>
                    ))}
                    {novel.genres.length > 3 && (
                      <span className="text-[10px] text-zinc-500">
                        +{novel.genres.length - 3} more
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-zinc-300 mb-6 line-clamp-2 flex-1">
                    {novel.synopsis || "No synopsis provided."}
                  </p>

                  {/* Footer stats + manage */}
                  <div className="flex justify-between items-center pt-4 border-t border-white/[0.06] mt-auto">
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Book className="w-3.5 h-3.5" />
                        {novel._count.chapters}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {novel.viewCount.toLocaleString()}
                      </span>
                    </div>
                    <Link href={`/dashboard/novel/${novel.id}`}>
                      <Button variant="secondary" size="sm" className="gap-2">
                        <Edit className="w-3 h-3" /> Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
