"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { BookOpen, Search, ArrowDownAZ, ArrowUpZA } from "lucide-react";
import { Button } from "./ui/button";

type Chapter = {
  slug: string;
  chapter_full_title: string;
  release_date: string;
};

type ChapterListProps = {
  chapters: Chapter[];
};

// ponytail: strip "Novel Title - " prefix from API's chapter_full_title
const getShortTitle = (fullTitle: string) => {
  const dashIdx = fullTitle.indexOf(" - ");
  return dashIdx !== -1 ? fullTitle.substring(dashIdx + 3) : fullTitle;
};

export const ChapterList = ({ chapters }: ChapterListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredAndSortedChapters = useMemo(() => {
    let result = [...chapters];

    // Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((chapter) =>
        chapter.chapter_full_title.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      // Simplistic sort assuming original array is chronological or reverse-chronological
      // You might need to parse chapter numbers if the API doesn't guarantee order
      return sortOrder === "asc" ? 1 : -1;
    });

    // We reverse if the requested sort order doesn't match the original order.
    // Assuming the API returns latest first (desc). If it returns first chapter first (asc), swap this logic.
    // Actually, safer approach:
    const originalIsDesc = true; // adjust based on your API
    if ((sortOrder === "asc" && originalIsDesc) || (sortOrder === "desc" && !originalIsDesc)) {
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
            {filteredAndSortedChapters.map((chapter) => (
              <li key={chapter.slug}>
                <Link
                  href={`/chapter/${chapter.slug}`}
                  className="flex justify-between items-center p-4 hover:bg-gray-800/60 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-gray-100" />{" "}
                    <span className="font-medium text-gray-200">
                      {getShortTitle(chapter.chapter_full_title)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {chapter.release_date}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-400">
            No chapters found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};
