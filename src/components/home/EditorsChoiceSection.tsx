import React from "react";
import NovelCard from "@/components/NovelCard";
import { Novel } from "@/types";

type EditorsChoiceProps = {
  apiData: Novel[];
};

const EditorsChoiceSection = ({ apiData }: EditorsChoiceProps) => {
  return (
    <div className="bg-gradient-to-b from-[#09090b] to-[#0c0c0e] text-white py-10 sm:py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-16 lg:px-36">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">Editor&apos;s Choice</h2>

        <div className="flex space-x-3 sm:space-x-4 md:space-x-6 overflow-x-auto pb-4 scrollbar-hide">
          {apiData?.map((novel) => {
            const urlParts = novel.url.split("/").filter(Boolean);
            const novelSlug = urlParts[urlParts.length - 1];

            return (
              <div key={novelSlug} className="w-40 sm:w-44 flex-shrink-0">
                <NovelCard slug={novelSlug} title={novel.title} imageUrl={novel.image_url} genres={novel.genres ?? undefined} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EditorsChoiceSection;
