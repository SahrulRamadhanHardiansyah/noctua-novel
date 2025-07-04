import React from "react";
import NovelCard from "@/components/NovelCard";
import { Novel } from "@/types";

type RecommendationProps = {
  apiData: Novel[];
};

const RecommendationSection = ({ apiData }: RecommendationProps) => {
  const getSlugFromUrl = (url: string) => {
    if (!url) return "";
    return url.split("/").filter(Boolean).pop() || "";
  };

  return (
    <div className="relative bg-[#111111] text-white pt-16 md:pt-24 pb-20">
      <div className="relative z-10 container mx-auto px-6 md:px-16 lg:px-36">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Recommended For You</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12">
          {apiData?.map((novel) => {
            const novelSlug = getSlugFromUrl(novel.url);

            return <NovelCard key={novelSlug} slug={novelSlug} title={novel.title} imageUrl={novel.image_url} latestChapter={novel.latest_chapters} />;
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default RecommendationSection;
