"use client";

import { useState } from "react";
import { Novel } from "@/types";
import NovelCard from "./NovelCard";
import { Button } from "./ui/button";
import { toast } from "sonner";

type FavoriteClientPageProps = {
  initialFavoriteNovels: Novel[];
};

export const FavoriteClientPage = ({ initialFavoriteNovels }: FavoriteClientPageProps) => {
  const [favoriteNovels, setFavoriteNovels] = useState(initialFavoriteNovels);

  const handleUnfavorite = async (novelSlug: string) => {
    const originalNovels = [...favoriteNovels];
    setFavoriteNovels(favoriteNovels.filter((novel) => novel.slug !== novelSlug));

    toast.info("Removed from favorites.");

    const response = await fetch("/api/favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novelSlug }),
    });

    if (!response.ok) {
      toast.error("Failed to remove favorite. Please try again.");
      setFavoriteNovels(originalNovels);
    }
  };

  return (
    <div className="container mx-auto px-6 md:px-16 lg:px-36 py-8">
      {favoriteNovels.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12">
          {favoriteNovels.map((novel) => {
            const lastChapter = novel.latest_chapters?.[novel.latest_chapters.length - 1];

            return (
              <div key={novel.slug} className="relative group">
                <NovelCard slug={novel.slug} title={novel.title} imageUrl={novel.image_url} latestChapter={lastChapter?.chapter_short_title} latestChapterSlug={lastChapter?.slug} genres={novel.genres} />
                <Button variant="destructive" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleUnfavorite(novel.slug)}>
                  Unfavorite
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-400 text-xl mt-8">You have no favorite novels yet.</p>
      )}
    </div>
  );
};
