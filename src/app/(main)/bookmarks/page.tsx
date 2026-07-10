"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Quote,
  Trash2,
  Share2,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import QuoteExportModal from "@/components/QuoteExportModal";

interface StoredBookmark {
  id: string;
  chapterSlug: string;
  novelSlug: string;
  selectedText: string | null;
  note: string | null;
  createdAt: string;
}

type Tab = "chapters" | "quotes";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<StoredBookmark[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("chapters");
  const [exportQuote, setExportQuote] = useState<StoredBookmark | null>(null);

  useEffect(() => {
    const loaded: StoredBookmark[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("bookmarks_")) {
        try {
          const data: StoredBookmark[] = JSON.parse(localStorage.getItem(key) || "[]");
          loaded.push(...data);
        } catch {}
      }
    }
    loaded.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setBookmarks(loaded);
  }, []);

  const chapterBookmarks = bookmarks.filter((b) => !b.selectedText);
  const savedQuotes = bookmarks.filter((b) => b.selectedText);

  const deleteBookmark = (chapterSlug: string, id: string) => {
    const key = `bookmarks_${chapterSlug}`;
    const stored: StoredBookmark[] = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = stored.filter((b) => b.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    toast.info("Removed");
  };

  const activeList = activeTab === "chapters" ? chapterBookmarks : savedQuotes;

  return (
    <div className="bg-[#09090b] text-white min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-6 md:px-16 lg:px-36">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/"
            className="text-zinc-500 hover:text-violet-400 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <Bookmark className="w-8 h-8 text-violet-400" /> Bookmarks & Quotes
            </h1>
            <p className="text-zinc-500 mt-1">
              {chapterBookmarks.length} bookmarked chapters · {savedQuotes.length} saved quotes
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900/50 border border-white/[0.06] rounded-xl p-1 mb-8 w-fit">
          <button
            onClick={() => setActiveTab("chapters")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === "chapters"
                ? "bg-violet-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Bookmarked Chapters
            {chapterBookmarks.length > 0 && (
              <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                {chapterBookmarks.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("quotes")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === "quotes"
                ? "bg-violet-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Quote className="w-4 h-4" />
            Saved Quotes
            {savedQuotes.length > 0 && (
              <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                {savedQuotes.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {activeList.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-white/[0.06]">
            <div className="bg-zinc-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              {activeTab === "chapters" ? (
                <Bookmark className="w-10 h-10 text-zinc-600" />
              ) : (
                <Quote className="w-10 h-10 text-zinc-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {activeTab === "chapters"
                ? "No bookmarked chapters"
                : "No saved quotes"}
            </h2>
            <p className="text-zinc-500 mb-8 max-w-md mx-auto">
              {activeTab === "chapters"
                ? "While reading a chapter, click the bookmark icon (🔖) to save it here."
                : "Select any text while reading a chapter, then save it as a quote to see it here."}
            </p>
            <Link href="/">
              <Button>Browse Novels</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeList.map((bm) => (
              <div
                key={bm.id}
                className="bg-zinc-900/50 border border-white/[0.06] rounded-xl p-5 hover:border-violet-500/20 transition-all duration-300"
              >
                {activeTab === "quotes" && bm.selectedText ? (
                  // Quote card
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="border-l-4 border-violet-500/50 pl-4 mb-3">
                        <p className="text-zinc-200 italic leading-relaxed">
                          &ldquo;{bm.selectedText}&rdquo;
                        </p>
                      </div>
                      {bm.note && (
                        <p className="text-sm text-zinc-500 mb-2">
                          Note: {bm.note}
                        </p>
                      )}
                      <p className="text-xs text-zinc-600">
                        From: {bm.chapterSlug.replace(/-/g, " ").replace("community ", "")} ·{" "}
                        {new Date(bm.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExportQuote(bm)}
                        className="gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Export
                      </Button>
                      <Link href={`/chapter/${bm.chapterSlug}`}>
                        <Button variant="ghost" size="sm" className="gap-1.5 w-full">
                          <ExternalLink className="w-3.5 h-3.5" /> Go
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBookmark(bm.chapterSlug, bm.id)}
                        className="text-zinc-500 hover:text-red-400 gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Chapter bookmark card
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="bg-violet-500/10 rounded-lg p-3 flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-violet-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white truncate">
                          {bm.chapterSlug
                            .replace(/-/g, " ")
                            .replace("community ", "")}
                        </h3>
                        {bm.note && (
                          <p className="text-sm text-zinc-500 truncate">
                            {bm.note}
                          </p>
                        )}
                        <p className="text-xs text-zinc-600 mt-1">
                          {new Date(bm.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link href={`/chapter/${bm.chapterSlug}`}>
                        <Button variant="outline" size="sm">
                          Read
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBookmark(bm.chapterSlug, bm.id)}
                        className="text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quote Export Modal */}
      {exportQuote && exportQuote.selectedText && (
        <QuoteExportModal
          quoteText={exportQuote.selectedText}
          source={exportQuote.chapterSlug
            .replace(/-/g, " ")
            .replace("community ", "")}
          onClose={() => setExportQuote(null)}
        />
      )}
    </div>
  );
}
