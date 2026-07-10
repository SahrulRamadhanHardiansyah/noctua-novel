import React from "react";
import NovelCard from "@/components/NovelCard";
import { Novel } from "@/types";

type LatestSectionProps = {
  apiData: Novel[];
};

const LatestSection = ({ apiData }: LatestSectionProps) => {
  return (
    <div className="bg-[#09090b] text-white py-10 sm:py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-16 lg:px-36">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">Latest Release</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:gap-x-6 md:gap-y-10">
          {apiData?.map((novel: Novel) => {
            const latestChapterInfo = novel.latest_chapters?.[0];

            if (!latestChapterInfo || !latestChapterInfo.url) {
              return null;
            }

            const urlParts = novel.url.split("/").filter(Boolean);
            const novelSlug = urlParts[urlParts.length - 1];

            const urlLatestChapterParts = latestChapterInfo.url.split("/").filter(Boolean);
            const latestChapterSlug = urlLatestChapterParts[urlLatestChapterParts.length - 1];

            return <NovelCard key={novelSlug} slug={novelSlug} title={novel.title} imageUrl={novel.image_url} latestChapter={latestChapterInfo.title} latestChapterSlug={latestChapterSlug} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default LatestSection;
