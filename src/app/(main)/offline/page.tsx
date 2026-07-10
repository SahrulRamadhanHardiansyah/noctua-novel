"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Trash2, WifiOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface OfflineChapter {
  title: string;
  content: string;
  novelSlug: string;
  chapterSlug: string;
  downloadedAt: string;
}

export default function OfflineLibraryPage() {
  const [chapters, setChapters] = useState<OfflineChapter[]>([]);
  const [selected, setSelected] = useState<OfflineChapter | null>(null);

  useEffect(() => {
    const loaded: OfflineChapter[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("offline_chapter_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || "");
          loaded.push(data);
        } catch {}
      }
    }
    // Sort by download date, newest first
    loaded.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime());
    setChapters(loaded);
  }, []);

  const deleteOffline = (chapterSlug: string) => {
    localStorage.removeItem(`offline_chapter_${chapterSlug}`);
    setChapters((prev) => prev.filter((c) => c.chapterSlug !== chapterSlug));
    if (selected?.chapterSlug === chapterSlug) setSelected(null);
    toast.info("Chapter removed from offline library");
  };

  const wordCount = (content: string) =>
    content.trim() ? content.trim().split(/\s+/).length : 0;

  // If a chapter is selected, show its content
  if (selected) {
    return (
      <div className="bg-[#09090b] text-white min-h-screen pt-28 pb-16">
        <div className="container mx-auto px-6 md:px-16 lg:px-36">
          <button
            onClick={() => setSelected(null)}
            className="inline-flex items-center text-sm text-zinc-500 hover:text-violet-400 mb-8 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Offline Library
          </button>

          <h1 className="text-2xl font-bold text-white mb-2">{selected.title}</h1>
          <p className="text-zinc-500 text-sm mb-8">
            Downloaded {new Date(selected.downloadedAt).toLocaleString()} · {wordCount(selected.content).toLocaleString()} words
          </p>

          <article className="max-w-4xl mx-auto leading-loose text-zinc-300">
            {selected.content.split("\n").map((p, i) => (
              <p key={i} className="mb-6">{p}</p>
            ))}
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#09090b] text-white min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-6 md:px-16 lg:px-36">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link href="/" className="text-zinc-500 hover:text-violet-400 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <WifiOff className="w-8 h-8 text-violet-400" /> Offline Library
            </h1>
            <p className="text-zinc-500 mt-1">
              {chapters.length} chapter{chapters.length !== 1 ? "s" : ""} saved for offline reading
            </p>
          </div>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-white/[0.06]">
            <div className="bg-zinc-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <WifiOff className="w-10 h-10 text-zinc-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No offline chapters</h2>
            <p className="text-zinc-500 mb-8 max-w-md mx-auto">
              While reading a chapter, tap the download icon (↓) in the toolbar to save it for offline reading.
            </p>
            <Link href="/">
              <Button>Browse Novels</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {chapters.map((ch) => (
              <div
                key={ch.chapterSlug}
                className="bg-zinc-900/50 border border-white/[0.06] rounded-xl p-5 flex items-center justify-between gap-4 hover:border-violet-500/20 transition-all duration-300"
              >
                <div
                  className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer"
                  onClick={() => setSelected(ch)}
                >
                  <div className="bg-violet-500/10 rounded-lg p-3 flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white truncate">{ch.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      {wordCount(ch.content).toLocaleString()} words · Downloaded {new Date(ch.downloadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/chapter/${ch.chapterSlug}`}>
                    <Button variant="outline" size="sm">Read Online</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteOffline(ch.chapterSlug)}
                    className="text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
