import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

type CommunityNovel = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  genres: string[];
  synopsis: string | null;
  viewCount: number;
  createdAt: Date;
  _count: { chapters: number };
};

type CommunityNovelsSectionProps = {
  novels: CommunityNovel[];
};

const CommunityNovelsSection = ({ novels }: CommunityNovelsSectionProps) => {
  if (novels.length === 0) return null;

  return (
    <div className="bg-[#09090b] text-white py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-16 lg:px-36">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-7 h-7 text-violet-400" />
          <h2 className="text-3xl md:text-4xl font-bold">Community Originals</h2>
        </div>
        <p className="text-gray-400 mb-10 max-w-2xl">
          Original stories written by our community authors. Support indie creators and discover fresh voices.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {novels.map((novel) => (
            <Link key={novel.id} href={`/novel/community-${novel.slug}`} className="group block">
              <div className="overflow-hidden rounded-xl ring-1 ring-white/[0.06]">
                {novel.imageUrl ? (
                  <Image
                    src={`/api/proxy-image?url=${encodeURIComponent(novel.imageUrl)}`}
                    alt={novel.title}
                    width={500}
                    height={700}
                    unoptimized
                    className="aspect-[3/4] w-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                  />
                ) : (
                  <div className="aspect-[3/4] w-full bg-gradient-to-br from-violet-900/40 to-zinc-900 flex items-center justify-center">
                    <span className="text-zinc-600 text-sm">No Cover</span>
                  </div>
                )}
              </div>
              <div className="mt-3">
                {novel.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {novel.genres.slice(0, 2).map((genre) => (
                      <Badge key={genre} variant="default">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}
                <h3 className="font-semibold text-base text-white truncate group-hover:text-violet-400 transition-colors">
                  {novel.title}
                </h3>
                <p className="text-sm text-zinc-500 mt-1">
                  {novel._count.chapters} chapter{novel._count.chapters !== 1 ? "s" : ""} · {novel.viewCount.toLocaleString()} views
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityNovelsSection;
