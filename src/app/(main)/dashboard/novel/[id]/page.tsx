import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function ManageNovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const novel = await prisma.userNovel.findUnique({
    where: { id, userId },
    include: {
      chapters: {
        orderBy: { orderIndex: "desc" }
      }
    }
  });

  if (!novel) redirect("/dashboard");

  return (
    <div className="container mx-auto px-6 md:px-16 lg:px-36 py-24 min-h-screen">
      <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-10 mb-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4">
          {novel.imageUrl ? (
            <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-gray-700">
              <Image src={`/api/proxy-image?url=${encodeURIComponent(novel.imageUrl)}`} alt={novel.title} fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="aspect-[3/4] w-full bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 border border-gray-700">
              No Cover
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-white">{novel.title}</h1>
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
              {novel.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {novel.genres.map(g => (
              <span key={g} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">{g}</span>
            ))}
          </div>

          <h3 className="font-semibold text-white mb-2">Synopsis</h3>
          <p className="text-gray-400 whitespace-pre-wrap">{novel.synopsis || "No synopsis provided."}</p>

          <div className="mt-8 flex gap-4">
            <Link href={`/novel/community-${novel.slug}`} target="_blank">
              <Button variant="secondary">View Public Page</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Chapters ({novel.chapters.length})</h2>
        <Link href={`/dashboard/novel/${novel.id}/create-chapter`}>
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" /> Add Chapter
          </Button>
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {novel.chapters.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No chapters yet. Create your first chapter!</div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {novel.chapters.map((chapter) => (
              <li key={chapter.id} className="p-4 hover:bg-gray-800/50 flex justify-between items-center transition">
                <div>
                  <span className="text-gray-500 mr-4 text-sm">#{chapter.orderIndex}</span>
                  <span className="font-medium text-gray-200">{chapter.title}</span>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-4">
                  <span>{new Date(chapter.createdAt).toLocaleDateString()}</span>
                  <Link href={`/chapter/community-${chapter.slug}`} target="_blank" className="text-primary hover:underline">
                    Read
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
