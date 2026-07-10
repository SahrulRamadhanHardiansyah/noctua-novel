import React from "react";
import NovelCard from "@/components/NovelCard";
import { Novel } from "@/types";
import { getSlugFromUrl } from "@/lib/utils/slug";

type RecommendationProps = {
  apiData: Novel[];
};

const RecommendationSection = ({ apiData }: RecommendationProps) => {
  return (
    <div className="relative bg-[#0c0c0e] text-white pt-10 sm:pt-16 md:pt-24 pb-12 sm:pb-20">
      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-16 lg:px-36">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">Recommended For You</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-8 md:gap-y-12">
          {apiData?.map((novel) => {
            const novelSlug = getSlugFromUrl(novel.url);
            const latestChapter = novel.latest_chapters?.[0];

            return <NovelCard key={novelSlug} slug={novelSlug} title={novel.title} imageUrl={novel.image_url} latestChapter={latestChapter?.title} latestChapterSlug={latestChapter?.slug} />;
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none"></div>
    </div>
  );
};

export default RecommendationSection;
