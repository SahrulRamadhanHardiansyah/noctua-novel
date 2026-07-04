import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, Book, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch user's uploaded novels
  const myNovels = await prisma.userNovel.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { chapters: true }
      }
    }
  });

  return (
    <div className="bg-gray-950 text-white min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6 md:px-16 lg:px-36">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Dashboard</h1>
            <p className="text-gray-400">Manage your original novels and chapters</p>
          </div>
          <Link href="/dashboard/create-novel">
            <Button className="gap-2 shadow-lg hover:shadow-primary/20 transition-all">
              <PlusCircle className="w-4 h-4" /> Create Novel
            </Button>
          </Link>
        </div>

        {myNovels.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800 shadow-xl">
            <div className="bg-gray-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Book className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No novels yet</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Start your journey as an author. Write your first original novel and share it with the NoctuaNovel community!</p>
            <Link href="/dashboard/create-novel">
              <Button size="lg" className="px-8 font-medium">Start Writing</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myNovels.map(novel => (
              <div key={novel.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all hover:shadow-2xl hover:shadow-black flex flex-col group">
                {/* Optional Cover Banner */}
                <div className="h-32 bg-gray-800 relative w-full overflow-hidden">
                  {novel.imageUrl ? (
                    <Image src={`/api/proxy-image?url=${encodeURIComponent(novel.imageUrl)}`} alt={novel.title} fill className="object-cover opacity-60 group-hover:opacity-80 transition-opacity" unoptimized />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-black/60 backdrop-blur text-white px-3 py-1 rounded-full border border-white/10">
                      {novel.status}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white line-clamp-1 mb-2 group-hover:text-primary transition-colors">{novel.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {novel.genres.slice(0, 3).map(g => (
                      <span key={g} className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-[10px] font-medium tracking-wide">{g}</span>
                    ))}
                    {novel.genres.length > 3 && <span className="text-[10px] text-gray-500">+{novel.genres.length - 3} more</span>}
                  </div>

                  <p className="text-sm text-gray-400 mb-6 line-clamp-2 flex-1">
                    {novel.synopsis || "No synopsis provided."}
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-800/50 mt-auto">
                    <div className="flex items-center text-gray-400 text-sm font-medium">
                      <Book className="w-4 h-4 mr-2 text-gray-500" />
                      {novel._count.chapters} Chapters
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
