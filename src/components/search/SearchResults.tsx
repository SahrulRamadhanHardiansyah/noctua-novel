import React from "react";
import { getNovelResponse } from "@/lib/api-libs";
import { Novel } from "@/types";
import NovelCard from "@/components/NovelCard";
import Header from "@/components/search/Header";
import { getSlugFromUrl } from "@/lib/utils/slug";

const SearchResults = async ({ keyword }: { keyword: string }) => {
  const decodedKeyword = decodeURIComponent(keyword);
  const searchResults = await getNovelResponse("search", `q=${decodedKeyword}`);

  return (
    <section className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-6 md:px-16 lg:px-36 py-24">
        <Header title={`Search Results for "${decodedKeyword}"`} />

        {searchResults.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12 mt-8">
            {searchResults.map((novel: Novel) => {
              const novelSlug = getSlugFromUrl(novel.url);
              const latestChapter = novel.latest_chapters?.[0];
              return <NovelCard key={novelSlug} slug={novelSlug} title={novel.title} imageUrl={novel.image_url} latestChapter={latestChapter?.title} latestChapterSlug={latestChapter?.slug} genres={novel.genres ?? undefined} />;
            })}
          </div>
        ) : (
          <p className="text-center text-gray-400 text-xl mt-16">No novels found for &quot;{decodedKeyword}&quot;.</p>
        )}
      </div>
    </section>
  );
};

export default SearchResults;
