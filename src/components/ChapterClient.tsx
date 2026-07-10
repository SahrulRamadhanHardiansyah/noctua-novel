"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings, Minus, Plus, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ChapterNavInfo = {
  slug: string;
  title: string;
} | null;

type ChapterClientProps = {
  chapterTitle: string;
  content: string;
  novelSlug: string;
  prevChapter?: ChapterNavInfo;
  nextChapter?: ChapterNavInfo;
};

const fontSizes = ["text-base", "text-lg", "text-xl", "text-2xl"];

const ChapterClient = ({ chapterTitle, content, novelSlug, prevChapter, nextChapter }: ChapterClientProps) => {
  const scrollKey = `scroll_${novelSlug}_${chapterTitle}`;
  const fontKey = `fontSize_${novelSlug}`;

  const [fontSizeIndex, setFontSizeIndex] = useState(() => {
    if (typeof window === "undefined") return 1;
    const saved = localStorage.getItem(fontKey);
    return saved ? Number(saved) : 1;
  });
  const [readingProgress, setReadingProgress] = useState(0);
  const router = useRouter();

  // Restore scroll position on mount
  useEffect(() => {
    const saved = localStorage.getItem(scrollKey);
    if (saved) {
      const timer = setTimeout(() => window.scrollTo(0, Number(saved)), 100);
      return () => clearTimeout(timer);
    }
  }, [scrollKey]);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (docHeight > 0) {
      setReadingProgress(Math.min(100, (scrollTop / docHeight) * 100));
    }
    // Save scroll position
    localStorage.setItem(scrollKey, String(scrollTop));
  }, [scrollKey]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prevChapter) router.push(`/chapter/${prevChapter.slug}`);
      if (e.key === "ArrowRight" && nextChapter) router.push(`/chapter/${nextChapter.slug}`);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevChapter, nextChapter, router]);

  const handleFontSizeChange = (direction: "increase" | "decrease") => {
    setFontSizeIndex((prev) => {
      const next = direction === "increase" ? Math.min(prev + 1, fontSizes.length - 1) : Math.max(prev - 1, 0);
      localStorage.setItem(fontKey, String(next));
      return next;
    });
  };

  const formattedContent = useMemo(() => content.split("\n").map((p, i) => {
    // ponytail: Simple regex for Markdown images instead of a full MD parser
    // Format: ![alt text](image_url)
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

    if (imgRegex.test(p)) {
      // Split the paragraph by images and render them interchangeably
      const parts = p.split(imgRegex);
      if (parts.length > 1) {
        return (
          <p key={i} className="mb-6 flex flex-col items-center gap-4">
            {parts.map((part, idx) => {
              // The regex split returns: [text, alt1, url1, text, alt2, url2, ...]
              if (idx % 3 === 0) return part ? <span key={idx}>{part}</span> : null;
              if (idx % 3 === 2) {
                const url = part;
                const alt = parts[idx - 1] || "Chapter image";
                return (
                  /* ponytail: img tag intentional — user-generated markdown URLs, next/image needs known domains */
                  <img key={idx} src={`/api/proxy-image?url=${encodeURIComponent(url)}`} alt={alt} className="max-w-full rounded-md shadow-md" loading="lazy" />
                );
              }
              return null;
            })}
          </p>
        );
      }
    }

    return (
      <p key={i} className="mb-6">
        {p}
      </p>
    );
  }), [content]);

  return (
    <div className="bg-[#09090b] min-h-screen text-zinc-300 pt-12">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-zinc-800">
        <div
          className="h-full bg-violet-500/80 transition-[width] duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <main className="container mx-auto px-4 md:px-8 lg:px-36">
        <header className="py-3 flex justify-between items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.push(`/novel/${novelSlug}`)} aria-label="Back to novel">
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <h1 className="text-lg font-semibold text-white text-center flex-grow mx-4">{chapterTitle}</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild={false}>
              <Button variant="outline" size="icon" aria-label="Reading settings">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Reading Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">Font Size</DropdownMenuLabel>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <Button variant="outline" size="icon" onClick={() => handleFontSizeChange("decrease")} aria-label="Decrease font size">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-16 text-center">{fontSizes[fontSizeIndex].replace("text-", "").toUpperCase()}</span>
                  <Button variant="outline" size="icon" onClick={() => handleFontSizeChange("increase")} aria-label="Increase font size">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <article className={`w-full max-w-4xl mx-auto leading-loose transition-all duration-200 ${fontSizes[fontSizeIndex]}`}>{formattedContent}</article>

        {/* Chapter Navigation */}
        <div className="flex justify-between items-center mt-12 pb-20 max-w-4xl mx-auto gap-4">
          {prevChapter ? (
            <Link href={`/chapter/${prevChapter.slug}`} className="flex-1">
              <Button variant="outline" className="w-full justify-start gap-2 text-left">
                <ChevronLeft className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{prevChapter.title}</span>
              </Button>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          <Button variant="secondary" onClick={() => router.push(`/novel/${novelSlug}`)} className="flex-shrink-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Chapters
          </Button>

          {nextChapter ? (
            <Link href={`/chapter/${nextChapter.slug}`} className="flex-1">
              <Button variant="outline" className="w-full justify-end gap-2 text-right">
                <span className="truncate">{nextChapter.title}</span>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </Button>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </main>
    </div>
  );
};

export default ChapterClient;
