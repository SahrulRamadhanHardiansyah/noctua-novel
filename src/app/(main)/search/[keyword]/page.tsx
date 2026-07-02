import React from "react";
import SearchResults from "@/components/search/SearchResults";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ keyword: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { keyword } = await params;
  const decodedKeyword = decodeURIComponent(keyword);

  return {
    title: `Search: "${decodedKeyword}" | NoctuaNovel`,
    description: `Search results for "${decodedKeyword}" on NoctuaNovel.`,
  };
}

const Page = async ({ params }: Props) => {
  const { keyword } = await params;
  return <SearchResults keyword={keyword} />;
};

export default Page;
