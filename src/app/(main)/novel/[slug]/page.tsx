import { NovelDetailClient } from "@/components/NovelDetailClient";
import React from "react";
import { getNovelResponse } from "@/lib/api-libs";
import { NovelDetail } from "@/types";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const novel: NovelDetail = await getNovelResponse(`novel/${slug}`);
    return {
      title: `${novel.title} | NoctuaNovel`,
      description: novel.synopsis?.slice(0, 160) ?? `Read ${novel.title} on NoctuaNovel`,
      openGraph: {
        title: novel.title,
        description: novel.synopsis?.slice(0, 160) ?? `Read ${novel.title} on NoctuaNovel`,
        images: novel.image_url ? [{ url: novel.image_url }] : [],
      },
    };
  } catch {
    return {
      title: "Novel | NoctuaNovel",
    };
  }
}

const Page = async ({ params }: Props) => {
  const { slug } = await params;
  return <NovelDetailClient slug={slug} />;
};

export default Page;
