"use client";

import React, { useState, FormEvent, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MenuIcon, SearchIcon, TicketPlus, XIcon, BookOpen, Coins, PenTool, Trophy } from "lucide-react";
import { useClerk, UserButton, useUser } from "@clerk/nextjs";
import { getSlugFromUrl } from "@/lib/utils/slug";
import Image from "next/image";
import NotificationBell from "@/components/NotificationBell";
import CoinBalance from "@/components/CoinBalance";

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
          // Limit to 5 results for the dropdown
          setLiveResults(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      } catch (error) {
        // non-critical: search degrades silently
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
      const targetElement = document.getElementById(targetId);
      if (targetElement) targetElement.scrollIntoView({ behavior: "smooth" });
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
    <nav className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5" aria-label="Main navigation">
      <Link href="/" className="max-md:flex-1">
        <h1 className="text-xl text-gray-100 font-bold">NoctuaNovel</h1>
      </Link>

      {!isSearchOpen && (
        <div
          className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 md:px-8 py-3 max-md:h-screen md:rounded-full backdrop-blur-xl text-gray-100 max-md:bg-[#09090b]/95 md:bg-white/[0.03] md:border border-white/[0.06] overflow-hidden transition-all duration-300 ${
            isOpen ? "max-md:w-full" : "max-md:w-0"
          }`}
        >
          <button className="md:hidden absolute top-6 right-6 cursor-pointer" onClick={() => setIsOpen(false)} aria-label="Close menu">
            <XIcon className="w-6 h-6" />
          </button>

          <a href="/" onClick={(e) => { e.preventDefault(); pathname === "/" ? window.scrollTo({ top: 0, behavior: "smooth" }) : router.push("/"); setIsOpen(false); }}>Home</a>
          <a href="#latest" onClick={(e) => handleScrollOrNavigate(e, "latest")}>Latest</a>
          <a href="#editors-choice" onClick={(e) => handleScrollOrNavigate(e, "editors-choice")}>Editor&apos;s Choice</a>
          <a href="#recommendation" onClick={(e) => handleScrollOrNavigate(e, "recommendation")}>Recommendation</a>
          <a href="#community-originals" onClick={(e) => handleScrollOrNavigate(e, "community-originals")}>Community</a>
          {user && <Link href="/favorite" onClick={() => handleLinkClick("/favorite")}>Favorite</Link>}
          {user && (
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="md:hidden flex items-center gap-2">
              <PenTool className="w-5 h-5" />
              Author Studio
            </Link>
          )}

          {/* Mobile Search */}
          <div className="md:hidden w-4/5 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center rounded-full bg-white/[0.05] border border-white/[0.08] px-4 py-2">
                <SearchIcon className="w-5 h-5 text-zinc-500 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search novels..."
                  className="bg-transparent text-gray-100 placeholder-zinc-500 w-full focus:outline-none"
                />
              </div>
            </form>
            {/* Mobile Live Results */}
            {liveResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-xl z-50">
                {liveResults.map((novel) => {
                  const slug = getSlugFromUrl(novel.url);
                  return (
                    <Link key={slug} href={`/novel/${slug}`} onClick={() => { setLiveResults([]); setIsOpen(false); setSearchQuery(""); }} className="flex items-center gap-3 p-3 hover:bg-zinc-800/50 transition">
                      <div className="w-10 h-14 relative flex-shrink-0 bg-zinc-800">
                        {novel.image_url && <Image src={`/api/proxy-image?url=${encodeURIComponent(novel.image_url)}`} alt="" fill unoptimized className="object-cover rounded-sm" />}
                      </div>
                      <div className="flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">{novel.title}</p>
                          {novel.isCommunity && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 flex-shrink-0">
                              Community
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 truncate w-full">{novel.genres?.join(", ")}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Search */}
      {isSearchOpen && (
        <div className="hidden md:flex flex-grow justify-center relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="flex items-center px-2 py-1 w-full max-w-lg rounded-full backdrop-blur-xl bg-white/[0.05] border border-white/[0.08] relative z-50">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search novels..." className="bg-transparent text-gray-100 placeholder-zinc-500 w-full px-4 py-2 focus:outline-none" autoFocus />
          </form>

          {/* Desktop Live Results */}
          {(liveResults.length > 0 || isSearching) && (
            <div className="absolute top-full mt-4 w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl z-40">
              {isSearching && liveResults.length === 0 ? (
                <div className="p-4 text-center text-sm text-zinc-500">Searching...</div>
              ) : (
                <>
                  {liveResults.map((novel) => {
                    const slug = getSlugFromUrl(novel.url);
                    return (
                      <Link key={slug} href={`/novel/${slug}`} onClick={() => { setLiveResults([]); setIsSearchOpen(false); setSearchQuery(""); }} className="flex items-center gap-4 p-3 hover:bg-zinc-800/50 transition">
                        <div className="w-12 h-16 relative flex-shrink-0 bg-zinc-800 rounded shadow-sm overflow-hidden">
                          {novel.image_url && <Image src={`/api/proxy-image?url=${encodeURIComponent(novel.image_url)}`} alt="" fill unoptimized className="object-cover" />}
                        </div>
                        <div className="flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-white truncate">{novel.title}</p>
                            {novel.isCommunity && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 flex-shrink-0">
                                Community
                              </span>
                            )}
                          </div>
                          {novel.genres && <p className="text-xs text-zinc-500 truncate w-full mt-1">{novel.genres.slice(0, 3).join(", ")}</p>}
                        </div>
                      </Link>
                    );
                  })}
                  <button onClick={handleSearchSubmit} className="w-full p-3 text-sm text-center text-primary font-medium hover:bg-zinc-800/50 bg-zinc-900/50 transition">
                    View all results
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-6">
        <button onClick={() => { setIsSearchOpen(!isSearchOpen); setLiveResults([]); setSearchQuery(""); }} className="hidden md:block" aria-label={isSearchOpen ? "Close search" : "Open search"}>
          {isSearchOpen ? <XIcon className="text-gray-100 w-6 h-6 cursor-pointer" /> : <SearchIcon className="text-gray-100 w-6 h-6 cursor-pointer" />}
        </button>

        {!user ? (
          <button onClick={() => openSignIn()} className="px-4 py-1 sm:px-7 sm:py-2 bg-violet-600 hover:bg-violet-500 text-white transition rounded-full font-medium cursor-pointer">Login</button>
        ) : (
          <div className="flex items-center gap-4">
            <CoinBalance />
            <NotificationBell />

            <UserButton appearance={{ elements: { userButtonAvatarBox: { width: "2.5rem", height: "2.5rem" } } }}>
              <UserButton.MenuItems>
                <UserButton.Action label="My Dashboard" labelIcon={<BookOpen className="w-4 h-4" />} onClick={() => handleLinkClick("/dashboard")} />
                <UserButton.Action label="My Favorite" labelIcon={<TicketPlus width={15} />} onClick={() => handleLinkClick("/favorite")} />
                <UserButton.Action label="Coins" labelIcon={<Coins className="w-4 h-4" />} onClick={() => handleLinkClick("/coins")} />
                <UserButton.Action label="Achievements" labelIcon={<Trophy className="w-4 h-4" />} onClick={() => handleLinkClick("/achievements")} />
              </UserButton.MenuItems>
            </UserButton>
          </div>
        )}
      </div>

      <button className="max-md:ml-4 md:hidden cursor-pointer" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu" aria-expanded={isOpen}>
        <MenuIcon className="w-8 h-8" />
      </button>
    </nav>
  );
}
