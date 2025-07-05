import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getNovelResponse } from "@/lib/api-libs";
import { NovelDetail } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Star, BookOpen, Layers, User } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { CommentSection } from "@/components/CommentSection";

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// @ts-ignore 
const Page = async ({ params }: Props) => {
  const { slug } = params;
  const novel: NovelDetail = await getNovelResponse(`novel/${slug}`);

  if (!novel) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-xl text-white">Novel not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="relative pt-40 pb-16">
        <div className="absolute inset-0">
          <Image src={novel.image_url} alt={`${novel.title} background`} fill className="object-cover opacity-60 blur-2xl" />
          <div className="absolute inset-0" />
        </div>

        <div className="relative container mx-auto px-6 md:px-16 lg:px-36 flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
          <div className="w-48 md:w-1/4 flex-shrink-0">
            <Image src={novel.image_url} alt={novel.title} width={500} height={700} className="rounded-lg shadow-lg w-full aspect-[3/4] object-cover" priority />
          </div>
          <div className="w-full md:w-3/4 flex flex-col gap-4 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white">{novel.title}</h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-300">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>{novel.rating || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                <span>{novel.metadata.status || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{novel.metadata.author || "N/A"}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {novel.genres?.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>

            <FavoriteButton novelSlug={slug} />

            <div>
              <h2 className="text-xl font-semibold mb-2 mt-4">Synopsis</h2>
              <p className="text-gray-300 text-base leading-relaxed">{novel.synopsis}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-6 md:px-16 lg:px-36">
          <h2 className="text-3xl font-bold mb-6">Chapter List</h2>
          <div className="bg-gray-900/50 rounded-lg max-h-[60vh] overflow-y-auto scrollbar-hide">
            <ul className="divide-y divide-gray-700/50">
              {novel.chapters?.map((chapter) => (
                <li key={chapter.slug}>
                  <Link href={`/chapter/${chapter.slug}`} className="flex justify-between items-center p-4 hover:bg-gray-800/60 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-gray-100" />
                      <span className="font-medium">{chapter.chapter_full_title}</span>
                    </div>
                    <span className="text-sm text-gray-400">{chapter.release_date}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 md:px-16 lg:px-36 py-14">
        <CommentSection novelSlug={slug} />
      </div>
    </div>
  );
};

export default Page;
