"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

type NovelCardProps = {
  imageUrl: string;
  title: string;
  slug: string;
  genres?: string[];
  latestChapter?: string;
  latestChapterSlug?: string;
};

const NovelCard = ({ imageUrl, title, slug, genres, latestChapter, latestChapterSlug }: NovelCardProps) => {
  return (
    <Link href={`/novel/${slug}`} className="group block">
      <div className="overflow-hidden rounded-md">
        <Image src={imageUrl} alt={title} width={500} height={700} className="aspect-[3/4] w-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out" />
      </div>
      <div className="mt-3">
        {genres && genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>
        )}

        <h3 className="font-semibold text-base truncate group-hover:text-gray-400 transition-colors">{title}</h3>

        {latestChapter && latestChapterSlug && (
          <Link href={`/chapter/${latestChapterSlug}`} onClick={(e) => e.stopPropagation()} className="text-sm text-gray-400 mt-1 hover:text-white hover:underline">
            {latestChapter}
          </Link>
        )}
      </div>
    </Link>
  );
};

export default NovelCard;
