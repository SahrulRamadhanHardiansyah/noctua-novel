import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, Book, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="container mx-auto px-6 md:px-16 lg:px-36 py-24 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
        <Link href="/dashboard/create-novel">
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" /> Create Novel
          </Button>
        </Link>
      </div>

      {myNovels.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/30 rounded-xl border border-gray-800">
          <Book className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No novels yet</h2>
          <p className="text-gray-400 mb-6">Start writing your first original novel today!</p>
          <Link href="/dashboard/create-novel">
            <Button variant="outline">Write Now</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myNovels.map(novel => (
            <div key={novel.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white line-clamp-1">{novel.title}</h3>
                <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">{novel.status}</span>
              </div>

              <div className="flex-1 text-sm text-gray-400 mb-6 line-clamp-2">
                {novel.synopsis || "No synopsis provided."}
              </div>

              <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-800">
                <span className="text-xs text-gray-500">{novel._count.chapters} Chapters</span>
                <div className="flex gap-2">
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
  );
}
