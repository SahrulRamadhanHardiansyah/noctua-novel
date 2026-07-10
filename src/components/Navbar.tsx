"use client";

import React, { useState, FormEvent, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MenuIcon, SearchIcon, TicketPlus, XIcon, BookOpen, Coins, PenTool, Trophy, WifiOff, Bookmark } from "lucide-react";
import { useClerk, UserButton, useUser } from "@clerk/nextjs";
import { getSlugFromUrl } from "@/lib/utils/slug";
import Image from "next/image";
import NotificationBell from "@/components/NotificationBell";
import CoinBalance from "@/components/CoinBalance";
import XpBadge from "@/components/XpBadge";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setLiveResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchLiveResults = async () => {
      if (searchQuery.trim().length < 2) {
        setLiveResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setLiveResults(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      } catch {
        // non-critical
      } finally {
        setIsSearching(false);
      }
    };
    const debounceTimer = setTimeout(fetchLiveResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLinkClick = (path: string) => {
    if (path) router.push(path);
    setIsOpen(false);
  };

  const handleScrollOrNavigate = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (pathname === "/") {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${targetId}`);
    }
    setIsOpen(false);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setLiveResults([]);
      setIsSearchOpen(false);
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full" aria-label="Main navigation">
      {/* Main bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-16 lg:px-36 py-3 md:py-5">
        {/* Left: Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden cursor-pointer p-1 -ml-1"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <MenuIcon className="w-6 h-6 text-gray-100" />
          </button>
          <Link href="/">
            <h1 className="text-lg sm:text-xl text-gray-100 font-bold">NoctuaNovel</h1>
          </Link>
        </div>

        {/* Center: Desktop nav links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 px-6 py-2 rounded-full backdrop-blur-xl bg-white/[0.03] border border-white/[0.06]">
          <a href="/" onClick={(e) => { e.preventDefault(); pathname === "/" ? window.scrollTo({ top: 0, behavior: "smooth" }) : router.push("/"); }} className="text-sm text-gray-100 hover:text-white transition">Home</a>
          <a href="#latest" onClick={(e) => handleScrollOrNavigate(e, "latest")} className="text-sm text-gray-100 hover:text-white transition">Latest</a>
          <a href="#editors-choice" onClick={(e) => handleScrollOrNavigate(e, "editors-choice")} className="text-sm text-gray-100 hover:text-white transition">Editor&apos;s Choice</a>
          <a href="#recommendation" onClick={(e) => handleScrollOrNavigate(e, "recommendation")} className="text-sm text-gray-100 hover:text-white transition">Recommendation</a>
          <a href="#community-originals" onClick={(e) => handleScrollOrNavigate(e, "community-originals")} className="text-sm text-gray-100 hover:text-white transition">Community</a>
          {user && <Link href="/favorite" className="text-sm text-gray-100 hover:text-white transition">Favorite</Link>}
        </div>

        {/* Right: Search + User actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop search toggle */}
          <button
            onClick={() => { setIsSearchOpen(!isSearchOpen); setLiveResults([]); setSearchQuery(""); }}
            className="hidden md:block p-1 cursor-pointer"
            aria-label={isSearchOpen ? "Close search" : "Open search"}
          >
            {isSearchOpen ? <XIcon className="text-gray-100 w-5 h-5" /> : <SearchIcon className="text-gray-100 w-5 h-5" />}
          </button>

          {/* Mobile search toggle */}
          <button
            onClick={() => { setIsSearchOpen(!isSearchOpen); setLiveResults([]); setSearchQuery(""); }}
            className="md:hidden p-1 cursor-pointer"
            aria-label="Search"
          >
            <SearchIcon className="text-gray-100 w-5 h-5" />
          </button>

          {!user ? (
            <button onClick={() => openSignIn()} className="px-3 py-1.5 sm:px-5 sm:py-2 bg-violet-600 hover:bg-violet-500 text-white transition rounded-full text-xs sm:text-sm font-medium cursor-pointer">
              Login
            </button>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-3">
              <span className="hidden sm:block"><XpBadge /></span>
              <CoinBalance />
              <NotificationBell />
              <UserButton appearance={{ elements: { userButtonAvatarBox: { width: "2rem", height: "2rem" } } }}>
                <UserButton.MenuItems>
                  <UserButton.Action label="My Dashboard" labelIcon={<BookOpen className="w-4 h-4" />} onClick={() => handleLinkClick("/dashboard")} />
                  <UserButton.Action label="My Favorite" labelIcon={<TicketPlus width={15} />} onClick={() => handleLinkClick("/favorite")} />
                  <UserButton.Action label="Coins" labelIcon={<Coins className="w-4 h-4" />} onClick={() => handleLinkClick("/coins")} />
                  <UserButton.Action label="Achievements" labelIcon={<Trophy className="w-4 h-4" />} onClick={() => handleLinkClick("/achievements")} />
                  <UserButton.Action label="Bookmarks & Quotes" labelIcon={<Bookmark className="w-4 h-4" />} onClick={() => handleLinkClick("/bookmarks")} />
                  <UserButton.Action label="Offline Library" labelIcon={<WifiOff className="w-4 h-4" />} onClick={() => handleLinkClick("/offline")} />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          )}
        </div>
      </div>

      {/* Desktop search overlay */}
      {isSearchOpen && (
        <div className="hidden md:block px-4 sm:px-6 md:px-16 lg:px-36 pb-3">
          <div className="relative max-w-lg mx-auto" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="flex items-center px-3 py-1 w-full rounded-full backdrop-blur-xl bg-white/[0.05] border border-white/[0.08]">
              <SearchIcon className="w-4 h-4 text-zinc-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search novels..."
                className="bg-transparent text-gray-100 placeholder-zinc-500 w-full px-2 py-2 focus:outline-none text-sm"
                autoFocus
              />
            </form>
            {(liveResults.length > 0 || isSearching) && (
              <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl z-40">
                {isSearching && liveResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-zinc-500">Searching...</div>
                ) : (
                  <>
                    {liveResults.map((novel) => {
                      const slug = getSlugFromUrl(novel.url);
                      return (
                        <Link key={slug} href={`/novel/${slug}`} onClick={() => { setLiveResults([]); setIsSearchOpen(false); setSearchQuery(""); }} className="flex items-center gap-3 p-3 hover:bg-zinc-800/50 transition">
                          <div className="w-10 h-14 relative flex-shrink-0 bg-zinc-800 rounded shadow-sm overflow-hidden">
                            {novel.image_url && <Image src={`/api/proxy-image?url=${encodeURIComponent(novel.image_url)}`} alt="" fill unoptimized className="object-cover" />}
                          </div>
                          <div className="flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-white truncate">{novel.title}</p>
                              {novel.isCommunity && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 flex-shrink-0">Community</span>}
                            </div>
                            {novel.genres && <p className="text-xs text-zinc-500 truncate mt-1">{novel.genres.slice(0, 3).join(", ")}</p>}
                          </div>
                        </Link>
                      );
                    })}
                    <button onClick={handleSearchSubmit} className="w-full p-3 text-sm text-center text-violet-400 font-medium hover:bg-zinc-800/50 bg-zinc-900/50 transition">
                      View all results
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile slide-in menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-[#0c0c0e] border-r border-white/[0.06] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <span className="text-lg font-bold text-white">NoctuaNovel</span>
              <button onClick={() => setIsOpen(false)} className="p-1 cursor-pointer">
                <XIcon className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-white/[0.06]">
              <form onSubmit={handleSearchSubmit}>
                <div className="flex items-center rounded-lg bg-white/[0.05] border border-white/[0.08] px-3 py-2">
                  <SearchIcon className="w-4 h-4 text-zinc-500 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search novels..."
                    className="bg-transparent text-gray-100 placeholder-zinc-500 w-full focus:outline-none text-sm"
                  />
                </div>
              </form>
              {liveResults.length > 0 && (
                <div className="mt-2 space-y-1">
                  {liveResults.map((novel) => {
                    const slug = getSlugFromUrl(novel.url);
                    return (
                      <Link key={slug} href={`/novel/${slug}`} onClick={() => { setLiveResults([]); setIsOpen(false); setSearchQuery(""); }} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.05] transition">
                        <div className="w-8 h-11 relative flex-shrink-0 bg-zinc-800 rounded overflow-hidden">
                          {novel.image_url && <Image src={`/api/proxy-image?url=${encodeURIComponent(novel.image_url)}`} alt="" fill unoptimized className="object-cover" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">{novel.title}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{novel.genres?.slice(0, 2).join(", ")}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Nav links */}
            <div className="p-4 space-y-1">
              <a href="/" onClick={(e) => { e.preventDefault(); pathname === "/" ? window.scrollTo({ top: 0, behavior: "smooth" }) : router.push("/"); setIsOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] transition">Home</a>
              <a href="#latest" onClick={(e) => handleScrollOrNavigate(e, "latest")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] transition">Latest</a>
              <a href="#editors-choice" onClick={(e) => handleScrollOrNavigate(e, "editors-choice")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] transition">Editor&apos;s Choice</a>
              <a href="#recommendation" onClick={(e) => handleScrollOrNavigate(e, "recommendation")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] transition">Recommendation</a>
              <a href="#community-originals" onClick={(e) => handleScrollOrNavigate(e, "community-originals")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] transition">Community</a>
              {user && <Link href="/favorite" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] transition">Favorite</Link>}
            </div>

            {/* User section (mobile) */}
            {user && (
              <div className="p-4 border-t border-white/[0.06] space-y-1">
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] transition">
                  <PenTool className="w-4 h-4" /> Author Studio
                </Link>
                <Link href="/achievements" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] transition">
                  <Trophy className="w-4 h-4" /> Achievements
                </Link>
                <Link href="/bookmarks" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] transition">
                  <Bookmark className="w-4 h-4" /> Bookmarks & Quotes
                </Link>
                <Link href="/offline" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] transition">
                  <WifiOff className="w-4 h-4" /> Offline Library
                </Link>
                <Link href="/coins" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] transition">
                  <Coins className="w-4 h-4" /> Coins
                </Link>
              </div>
            )}

            {/* Login (mobile, not logged in) */}
            {!user && (
              <div className="p-4 border-t border-white/[0.06]">
                <button onClick={() => { openSignIn(); setIsOpen(false); }} className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium cursor-pointer transition">
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
