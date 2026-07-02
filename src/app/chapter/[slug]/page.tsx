import React from "react";
import { getNovelResponse } from "@/lib/api-libs";
import ChapterClient from "@/components/ChapterClient";
import { NovelDetail } from "@/types";
import type { Metadata } from "next";

type ChapterPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { slug: chapterSlug } = await params;
  const chapterData = await getNovelResponse(`chapter/${chapterSlug}`);
  const novelSlug = chapterSlug.substring(0, chapterSlug.lastIndexOf("-chapter-"));
  const readableNovel = novelSlug.replace(/-/g, " ");

  return {
    title: chapterData?.chapter_title
      ? `${chapterData.chapter_title} - ${readableNovel} | NoctuaNovel`
      : "Chapter | NoctuaNovel",
    description: `Read ${chapterData?.chapter_title ?? "this chapter"} of ${readableNovel} on NoctuaNovel.`,
  };
}

const Page = async ({ params }: ChapterPageProps) => {
  const { slug: chapterSlug } = await params;
  const chapterData = await getNovelResponse(`chapter/${chapterSlug}`);

  if (!chapterData || !chapterData.content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Chapter not found.</p>
      </div>
    );
  }

  const novelSlug = chapterSlug.substring(0, chapterSlug.lastIndexOf("-chapter-"));

  // Fetch novel detail to get chapter list for prev/next navigation
  let prevChapter = null;
  let nextChapter = null;

  try {
    const novelDetail: NovelDetail = await getNovelResponse(`novel/${novelSlug}`);
    if (novelDetail?.chapters) {
      const currentIndex = novelDetail.chapters.findIndex((ch) => ch.slug === chapterSlug);
      if (currentIndex > 0) {
        const prev = novelDetail.chapters[currentIndex - 1];
        prevChapter = { slug: prev.slug, title: prev.chapter_full_title };
      }
      if (currentIndex >= 0 && currentIndex < novelDetail.chapters.length - 1) {
        const next = novelDetail.chapters[currentIndex + 1];
        nextChapter = { slug: next.slug, title: next.chapter_full_title };
      }
    }
  } catch {
    // If novel detail fetch fails, just skip navigation — not critical
  }

  return (
    <ChapterClient
      chapterTitle={chapterData.chapter_title}
      content={chapterData.content}
      novelSlug={novelSlug}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
    />
  );
};

export default Page;
