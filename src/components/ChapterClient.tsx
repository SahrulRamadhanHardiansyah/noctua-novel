"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings, Minus, Plus, ArrowLeft, ChevronLeft, ChevronRight, Play, Pause, Square, BookmarkPlus, Volume2, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { markChapterAsRead } from "@/lib/utils/reading-history";

type ChapterNavInfo = {
  slug: string;
  title: string;
} | null;

type ChapterClientProps = {
  chapterTitle: string;
  content: string;
  novelSlug: string;
  chapterSlug?: string;
  prevChapter?: ChapterNavInfo;
  nextChapter?: ChapterNavInfo;
};

const fontSizes = ["text-base", "text-lg", "text-xl", "text-2xl"];

type FontFamily = { label: string; className: string };
const fontFamilies: FontFamily[] = [
  { label: "Sans-serif", className: "font-sans" },
  { label: "Serif", className: "font-serif" },
  { label: "Monospace", className: "font-mono" },
];

const ChapterClient = ({ chapterTitle, content, novelSlug, chapterSlug, prevChapter, nextChapter }: ChapterClientProps) => {
  const scrollKey = `scroll_${novelSlug}_${chapterTitle}`;
  const fontKey = `fontSize_${novelSlug}`;
  const fontFamilyKey = `fontFamily_${novelSlug}`;

  const [fontSizeIndex, setFontSizeIndex] = useState(() => {
    if (typeof window === "undefined") return 1;
    const saved = localStorage.getItem(fontKey);
    return saved ? Number(saved) : 1;
  });
  const [fontFamilyIndex, setFontFamilyIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem(fontFamilyKey);
    return saved ? Number(saved) : 0;
  });
  const [readingProgress, setReadingProgress] = useState(0);
  const router = useRouter();

  // TTS State
  const [ttsState, setTtsState] = useState<"idle" | "playing" | "paused">("idle");
  const [ttsRate, setTtsRate] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Bookmark State
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  // Load bookmarks on mount
  useEffect(() => {
    if (!chapterSlug) return;
    try {
      const stored = localStorage.getItem(`bookmarks_${chapterSlug}`);
      if (stored) setBookmarks(JSON.parse(stored));
    } catch {}
  }, [chapterSlug]);

  // TTS Functions
  const speak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = content.replace(/!\[.*?\]\(.*?\)/g, "").replace(/[#*_~`>]/g, "");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = ttsRate;
    utterance.lang = "en-US";
    utterance.onend = () => setTtsState("idle");
    utterance.onerror = () => setTtsState("idle");
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setTtsState("playing");
  }, [content, ttsRate]);

  const pauseTts = useCallback(() => {
    window.speechSynthesis?.pause();
    setTtsState("paused");
  }, []);

  const resumeTts = useCallback(() => {
    window.speechSynthesis?.resume();
    setTtsState("playing");
  }, []);

  const stopTts = useCallback(() => {
    window.speechSynthesis?.cancel();
    setTtsState("idle");
  }, []);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  // Bookmark Functions
  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
    }
  }, []);

  const saveBookmark = useCallback(() => {
    if (!chapterSlug) return;
    const bm = {
      id: Date.now().toString(),
      chapterSlug,
      novelSlug,
      selectedText: selectedText || null,
      note: bookmarkNote || null,
      createdAt: new Date().toISOString(),
    };
    const updated = [...bookmarks, bm];
    setBookmarks(updated);
    localStorage.setItem(`bookmarks_${chapterSlug}`, JSON.stringify(updated));
    setShowBookmarkDialog(false);
    setBookmarkNote("");
    setSelectedText("");
    toast.success(selectedText ? "Quote saved!" : "Bookmark saved!");
    // Trigger achievement if it's a quote (has selected text)
    if (selectedText) {
      fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger: "quote_saved" }),
      }).catch(() => {});
    }
  }, [chapterSlug, novelSlug, selectedText, bookmarkNote, bookmarks]);

  const deleteBookmark = useCallback((id: string) => {
    if (!chapterSlug) return;
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem(`bookmarks_${chapterSlug}`, JSON.stringify(updated));
    toast.info("Bookmark removed");
  }, [chapterSlug, bookmarks]);

  // Offline Download
  const downloadForOffline = useCallback(() => {
    try {
      const chapterData = {
        title: chapterTitle,
        content,
        novelSlug,
        chapterSlug,
        downloadedAt: new Date().toISOString(),
      };
      localStorage.setItem(`offline_chapter_${chapterSlug}`, JSON.stringify(chapterData));
      // Also tell the service worker to cache this page
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "CACHE_CHAPTER",
          url: window.location.href,
        });
      }
      toast.success("Chapter saved for offline reading!");
    } catch {
      toast.error("Failed to save chapter offline");
    }
  }, [chapterTitle, content, novelSlug, chapterSlug]);

  // Trigger achievement check + XP on chapter read
  useEffect(() => {
    if (!chapterSlug) return;
    // Achievement check
    fetch("/api/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trigger: "chapter_read", value: 1 }),
    }).catch(() => {});
    // XP reward
    fetch("/api/gamification/xp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trigger: "chapter_read" }),
    }).then(r => r.ok ? r.json() : null).then(data => {
      if (data?.leveledUp) {
        // Dispatch celebration event for LevelUpCelebration component
        window.dispatchEvent(new CustomEvent("noctua-level-up", {
          detail: { oldLevel: data.oldLevel, newLevel: data.newLevel, newBorders: data.newBorders || [] },
        }));
      }
    }).catch(() => {});
  }, [chapterSlug]);

  // Restore scroll position on mount
  useEffect(() => {
    const saved = localStorage.getItem(scrollKey);
    if (saved) {
      const timer = setTimeout(() => window.scrollTo(0, Number(saved)), 100);
      return () => clearTimeout(timer);
    }
  }, [scrollKey]);

  // Mark chapter as read when opened
  useEffect(() => {
    if (chapterSlug) {
      markChapterAsRead(chapterSlug);
    }
  }, [chapterSlug]);

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

  const handleFontFamilyChange = (index: number) => {
    setFontFamilyIndex(index);
    localStorage.setItem(fontFamilyKey, String(index));
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

      <main className="container mx-auto px-3 sm:px-4 md:px-8 lg:px-36">
        <header className="py-2 sm:py-3 flex justify-between items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Button variant="outline" size="icon" onClick={() => router.push(`/novel/${novelSlug}`)} aria-label="Back to novel" className="flex-shrink-0">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <h1 className="text-sm sm:text-base md:text-lg font-semibold text-white text-center flex-grow mx-2 sm:mx-4 truncate">{chapterTitle}</h1>

          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            {/* Bookmark button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowBookmarkDialog(true)}
              aria-label="Add bookmark"
              className="w-8 h-8 sm:w-9 sm:h-9"
            >
              <BookmarkPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>

            {/* Download for offline */}
            <Button
              variant="outline"
              size="icon"
              onClick={downloadForOffline}
              aria-label="Download for offline"
              className="w-8 h-8 sm:w-9 sm:h-9"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>

            {/* TTS button */}
            <Button
              variant="outline"
              size="icon"
              onClick={ttsState === "idle" ? speak : ttsState === "playing" ? pauseTts : resumeTts}
              aria-label="Text to speech"
              className="w-8 h-8 sm:w-9 sm:h-9"
            >
              {ttsState === "idle" ? <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : ttsState === "playing" ? <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            </Button>

            {ttsState !== "idle" && (
              <Button variant="outline" size="icon" onClick={stopTts} aria-label="Stop reading" className="w-8 h-8 sm:w-9 sm:h-9">
                <Square className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>

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
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">Font Family</DropdownMenuLabel>
                <div className="space-y-1 px-2 py-1.5">
                  {fontFamilies.map((font, idx) => (
                    <button
                      key={font.label}
                      onClick={() => handleFontFamilyChange(idx)}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                        idx === fontFamilyIndex
                          ? "bg-primary text-white"
                          : "hover:bg-gray-800 text-gray-300"
                      } ${font.className}`}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">Reading Speed</DropdownMenuLabel>
                <div className="flex items-center justify-between px-2 py-1.5">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setTtsRate(rate);
                        if (ttsState !== "idle" && utteranceRef.current) {
                          window.speechSynthesis?.cancel();
                          setTtsState("idle");
                        }
                      }}
                      className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                        ttsRate === rate
                          ? "bg-violet-600 text-white"
                          : "text-zinc-400 hover:bg-zinc-800"
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <article
          onMouseUp={handleTextSelect}
          className={`w-full max-w-4xl mx-auto leading-loose transition-all duration-200 ${fontSizes[fontSizeIndex]} ${fontFamilies[fontFamilyIndex].className}`}
        >
          {formattedContent}
        </article>

        {/* Bookmark Dialog */}
        {showBookmarkDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-white/[0.08] rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Save Bookmark</h3>
              {selectedText && (
                <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg border border-white/[0.06]">
                  <p className="text-xs text-zinc-500 mb-1">Selected text:</p>
                  <p className="text-sm text-zinc-300 line-clamp-3 italic">&ldquo;{selectedText}&rdquo;</p>
                </div>
              )}
              <textarea
                value={bookmarkNote}
                onChange={(e) => setBookmarkNote(e.target.value)}
                placeholder="Add a note (optional)..."
                className="w-full bg-zinc-800/50 border border-white/[0.08] rounded-lg p-3 text-white text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => { setShowBookmarkDialog(false); setSelectedText(""); }}>
                  Cancel
                </Button>
                <Button onClick={saveBookmark}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bookmarks List */}
        {bookmarks.length > 0 && (
          <div className="w-full max-w-4xl mx-auto mt-8 mb-4">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Bookmarks ({bookmarks.length})
            </h3>
            <div className="space-y-2">
              {bookmarks.map((bm) => (
                <div key={bm.id} className="bg-zinc-900/50 border border-white/[0.06] rounded-lg p-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {bm.selectedText && (
                      <p className="text-sm text-zinc-300 line-clamp-2 italic">&ldquo;{bm.selectedText}&rdquo;</p>
                    )}
                    {bm.note && <p className="text-xs text-zinc-500 mt-1">{bm.note}</p>}
                    <p className="text-[10px] text-zinc-600 mt-1">
                      {new Date(bm.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteBookmark(bm.id)}
                    className="text-zinc-600 hover:text-red-400 transition cursor-pointer text-xs flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chapter Navigation */}
        <div className="flex justify-between items-center mt-8 sm:mt-12 pb-16 sm:pb-20 max-w-4xl mx-auto gap-2 sm:gap-4">
          {prevChapter ? (
            <Link href={`/chapter/${prevChapter.slug}`} className="flex-1 min-w-0">
              <Button variant="outline" size="sm" className="w-full justify-start gap-1 sm:gap-2 text-left text-xs sm:text-sm">
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate max-w-[80px] sm:max-w-[150px] md:max-w-[200px]">{prevChapter.title}</span>
              </Button>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          <Button variant="secondary" size="sm" onClick={() => router.push(`/novel/${novelSlug}`)} className="flex-shrink-0 text-xs sm:text-sm">
            List Chapter
          </Button>

          {nextChapter ? (
            <Link href={`/chapter/${nextChapter.slug}`} className="flex-1 min-w-0">
              <Button variant="outline" size="sm" className="w-full justify-end gap-1 sm:gap-2 text-right text-xs sm:text-sm">
                <span className="truncate max-w-[80px] sm:max-w-[150px] md:max-w-[200px]">{nextChapter.title}</span>
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
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
