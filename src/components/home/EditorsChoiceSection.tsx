import React from "react";
import NovelCard from "@/components/NovelCard";
import { Novel } from "@/types";

type EditorsChoiceProps = {
  apiData: Novel[];
};

const EditorsChoiceSection = ({ apiData }: EditorsChoiceProps) => {
  return (
    <div className="bg-gradient-to-b from-black to-[#111111] text-white py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-16 lg:px-36">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Editor's Choice</h2>

        <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
          {apiData?.map((novel) => {
            const urlParts = novel.url.split("/").filter(Boolean);
            const novelSlug = urlParts[urlParts.length - 1];

            return (
              <div key={novelSlug} className="w-40 sm:w-44 flex-shrink-0">
                <NovelCard slug={novelSlug} title={novel.title} imageUrl={novel.image_url} genres={novel.genres} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EditorsChoiceSection;
