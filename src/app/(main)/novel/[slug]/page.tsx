import { NovelDetailClient } from "@/components/NovelDetailClient";
import React from "react";
import { getNovelResponse } from "@/lib/api-libs";
import { NovelDetail } from "@/types";
import type { Metadata } from "next";

import prisma from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const isCommunity = slug.startsWith("community-");

  try {
    let novelTitle = "Novel";
    let novelSynopsis = "";
    let novelImage = "";

    if (isCommunity) {
      const dbNovel = await prisma.userNovel.findUnique({
        where: { slug: slug.replace("community-", "") },
      });
      if (dbNovel) {
        novelTitle = dbNovel.title;
        novelSynopsis = dbNovel.synopsis || "";
        novelImage = dbNovel.imageUrl || "";
      }
    } else {
      const novel: NovelDetail = await getNovelResponse(`novel/${slug}`);
      novelTitle = novel.title;
      novelSynopsis = novel.synopsis || "";
      novelImage = novel.image_url || "";
    }

    return {
      title: `${novelTitle} | NoctuaNovel`,
      description: novelSynopsis.slice(0, 160) || `Read ${novelTitle} on NoctuaNovel`,
      openGraph: {
        title: novelTitle,
        description: novelSynopsis.slice(0, 160) || `Read ${novelTitle} on NoctuaNovel`,
        images: novelImage ? [{ url: novelImage, width: 500, height: 700 }] : [],
        type: "book",
        siteName: "NoctuaNovel",
      },
      twitter: {
        card: "summary_large_image",
        title: novelTitle,
        description: novelSynopsis.slice(0, 160) || `Read ${novelTitle} on NoctuaNovel`,
        images: novelImage ? [novelImage] : [],
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
