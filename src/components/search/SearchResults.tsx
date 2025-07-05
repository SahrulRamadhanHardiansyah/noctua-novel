import React from "react";
import { getNovelResponse } from "@/lib/api-libs";
import { Novel } from "@/types";
import NovelCard from "@/components/NovelCard";
import Header from "@/components/search/Header";

const SearchResults = async ({ keyword }: { keyword: string }) => {
  const decodedKeyword = decodeURIComponent(keyword);
  const searchResults = await getNovelResponse("search", `q=${decodedKeyword}`);

  const getSlugFromUrl = (url: string) => {
    if (!url) return "";
    return url.split("/").filter(Boolean).pop() || "";
  };

  return (
    <section className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-6 md:px-16 lg:px-36 py-24">
        <Header title={`Search Results for "${decodedKeyword}"`} />

        {searchResults.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12 mt-8">
            {searchResults.map((novel: Novel) => {
              const novelSlug = getSlugFromUrl(novel.url);
              return <NovelCard key={novelSlug} slug={novelSlug} title={novel.title} imageUrl={novel.image_url} latestChapter={novel.latest_chapters} genres={novel.genres} />;
            })}
          </div>
        ) : (
          <p className="text-center text-gray-400 text-xl mt-16">No novels found for "{decodedKeyword}".</p>
        )}
      </div>
    </section>
  );
};

export default SearchResults;
