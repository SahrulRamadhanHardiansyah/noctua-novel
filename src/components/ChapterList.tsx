"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Search, ArrowDownAZ, ArrowUpZA, Check } from "lucide-react";
import { Button } from "./ui/button";
import { formatChapterTitle } from "@/lib/utils/chapter";
import { isChapterInSet, getReadChapters } from "@/lib/utils/reading-history";

type Chapter = {
  slug: string;
  chapter_full_title: string;
  release_date: string;
};

type ChapterListProps = {
  chapters: Chapter[];
  novelTitle?: string;
};

export const ChapterList = ({ chapters, novelTitle }: ChapterListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [readSet, setReadSet] = useState<Set<string>>(new Set());

  // Load read chapters on mount
  useEffect(() => {
    setReadSet(new Set(getReadChapters()));
  }, []);

  const filteredAndSortedChapters = useMemo(() => {
    let result = [...chapters];

    // Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((chapter) =>
        chapter.chapter_full_title.toLowerCase().includes(query)
      );
    }

    // Sort: simply reverse the original order since API returns desc
    if (sortOrder === "asc") {
      result.reverse();
    }

    return result;
  }, [chapters, searchQuery, sortOrder]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chapters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          className="bg-gray-900 border-gray-700"
        >
          {sortOrder === "desc" ? (
            <>
              <ArrowDownAZ className="w-4 h-4 mr-2" /> Latest First
            </>
          ) : (
            <>
              <ArrowUpZA className="w-4 h-4 mr-2" /> First Chapter
            </>
          )}
        </Button>
      </div>

      <div className="bg-gray-900/50 rounded-lg max-h-[60vh] overflow-y-auto scrollbar-hide">
        {filteredAndSortedChapters.length > 0 ? (
          <ul className="divide-y divide-gray-700/50">
            {filteredAndSortedChapters.map((chapter) => {
              const isRead = isChapterInSet(chapter.slug, readSet);
              return (
                <li key={chapter.slug}>
                  <Link
                    href={`/chapter/${chapter.slug}`}
                    className={`flex justify-between items-center p-4 hover:bg-gray-800/60 transition-colors duration-200 ${
                      isRead ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isRead ? (
                        <Check className="w-4 h-4 text-green-500/70 flex-shrink-0" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-gray-100 flex-shrink-0" />
                      )}
                      <span className={`font-medium ${isRead ? "text-gray-500" : "text-gray-200"}`}>
                        {formatChapterTitle(chapter.chapter_full_title, novelTitle)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {chapter.release_date}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-400">
            No chapters found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
};
