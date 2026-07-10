import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, ArrowLeft, Book, Edit } from "lucide-react";
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
    <div className="bg-[#09090b] text-white min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6 md:px-16 lg:px-36">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-violet-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        <div className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-6 md:p-10 mb-10 flex flex-col md:flex-row gap-8 md:gap-12 shadow-2xl shadow-black/20">
          <div className="w-full md:w-1/4">
            {novel.imageUrl ? (
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl">
                <Image src={`/api/proxy-image?url=${encodeURIComponent(novel.imageUrl)}`} alt={novel.title} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="aspect-[3/4] w-full bg-zinc-800/50 rounded-xl flex items-center justify-center text-zinc-600 border border-white/[0.08] shadow-2xl">
                No Cover
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">{novel.title}</h1>
              <span className="px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-full text-xs uppercase tracking-wider font-bold whitespace-nowrap">
                {novel.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {novel.genres.map(g => (
                <span key={g} className="px-3 py-1 bg-zinc-800/50 text-zinc-300 border border-white/[0.06] rounded-md text-xs font-medium">{g}</span>
              ))}
            </div>

            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              Synopsis
            </h3>
            <p className="text-zinc-400 whitespace-pre-wrap leading-relaxed flex-1">{novel.synopsis || "No synopsis provided."}</p>

            <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-white/[0.06]">
              <Link href={`/novel/community-${novel.slug}`} target="_blank">
                <Button variant="default" className="gap-2 shadow-lg hover:shadow-primary/20 transition-all">
                  <Book className="w-4 h-4" /> View Public Page
                </Button>
              </Link>
              <Link href={`/dashboard/novel/${novel.id}/edit`}>
                <Button variant="secondary" className="gap-2">
                  <Edit className="w-4 h-4" /> Edit Details
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Chapters <span className="text-zinc-500 text-lg ml-2">({novel.chapters.length})</span></h2>
          <Link href={`/dashboard/novel/${novel.id}/create-chapter`}>
            <Button className="gap-2 shadow-lg hover:shadow-primary/20 transition-all">
              <PlusCircle className="w-4 h-4" /> Add Chapter
            </Button>
          </Link>
        </div>

        <div className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
          {novel.chapters.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-zinc-800/30 rounded-full flex items-center justify-center mb-4">
                <PlusCircle className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No chapters yet</h3>
              <p className="text-zinc-400 mb-6">Start building your story by creating the first chapter.</p>
              <Link href={`/dashboard/novel/${novel.id}/create-chapter`}>
                <Button>Create Chapter</Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {novel.chapters.map((chapter) => (
                <li key={chapter.id} className="p-5 hover:bg-white/[0.03] flex justify-between items-center transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                    <span className="text-zinc-600 font-mono text-sm w-12">#{chapter.orderIndex}</span>
                    <span className="font-semibold text-zinc-300 group-hover:text-violet-400 transition-colors">{chapter.title}</span>
                  </div>
                  <div className="text-sm text-zinc-500 flex items-center gap-6">
                    <span className="hidden md:inline-block">{new Date(chapter.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <Link href={`/dashboard/novel/${novel.id}/chapter/${chapter.id}/edit`} className="text-zinc-500 hover:text-white font-medium transition-colors px-3 py-1.5 hover:bg-zinc-800 rounded-full">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <Link href={`/chapter/community-${chapter.slug}`} target="_blank" className="text-violet-400 hover:text-violet-300 font-medium hover:underline transition-colors px-4 py-1.5 bg-violet-500/10 rounded-full">
                      Read
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
