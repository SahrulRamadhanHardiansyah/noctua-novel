"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MenuIcon, SearchIcon, TicketPlus, XIcon } from "lucide-react";
import { useClerk, UserButton, useUser } from "@clerk/nextjs";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();

  const handleLinkClick = (path: string) => {
    // scrollTo(0, 0);
    if (path) {
      router.push(path);
    }
    setIsOpen(false);
  };

  const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5">
      <Link href="/" className="max-md:flex-1">
        <h1 className="text-xl text-gray-100 font-bold">NoctuaNovel</h1>
      </Link>

      {!isSearchOpen && (
        <div
          className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 md:px-8 py-3 max-md:h-screen md:rounded-full backdrop-blur text-gray-100 bg-black/70 md:bg-white/10 md:border border-gray-300/20 overflow-hidden transition-all duration-300 ${
            isOpen ? "max-md:w-full" : "max-md:w-0"
          }`}
        >
          <XIcon className="md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer" onClick={() => setIsOpen(!isOpen)} />

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
              setIsOpen(false);
            }}
          >
            Home
          </a>
          <a href="#latest" onClick={(e) => handleScrollClick(e, "latest")}>
            Latest
          </a>
          <a href="#editors-choice" onClick={(e) => handleScrollClick(e, "editors-choice")}>
            Editor's Choice
          </a>
          <a href="#recommendation" onClick={(e) => handleScrollClick(e, "recommendation")}>
            Recommendation
          </a>
          {user && (
            <Link href="/favorite" onClick={() => handleLinkClick("/favorite")}>
              Favorite
            </Link>
          )}
        </div>
      )}

      {isSearchOpen && (
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-grow justify-center items-center md:px-2 py-1 max-w-lg md:rounded-full backdrop-blur bg-white/10 border border-gray-300/20">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search novels..." className="bg-transparent text-gray-100 placeholder-gray-200 w-full px-4 py-2 focus:outline-none" autoFocus />
        </form>
      )}

      <div className="flex items-center gap-8">
        <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="hidden md:block">
          {isSearchOpen ? <XIcon className="text-gray-100 w-6 h-6 cursor-pointer" /> : <SearchIcon className="text-gray-100 w-6 h-6 cursor-pointer" />}
        </button>

        {!user ? (
          <button onClick={() => openSignIn()} className="px-4 py-1 sm:px-7 sm:py-2 bg-gray-100 hover:bg-gray-400 text-black transition rounded-full font-medium cursor-pointer">
            Login
          </button>
        ) : (
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: { width: "2.5rem", height: "2.5rem" },
              },
            }}
          >
            <UserButton.MenuItems>
              <UserButton.Action label="My Favorite" labelIcon={<TicketPlus width={15} />} onClick={() => handleLinkClick("/favorite")} />
            </UserButton.MenuItems>
          </UserButton>
        )}
      </div>

      <MenuIcon className="max-md:ml-4 md:hidden w-8 h-8 cursor-pointer" onClick={() => setIsOpen(!isOpen)} />
    </div>
  );
};

export default Navbar;
