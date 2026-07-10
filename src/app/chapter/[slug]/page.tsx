import React from "react";
import { getNovelResponse } from "@/lib/api-libs";
import ChapterClient from "@/components/ChapterClient";
import { NovelDetail } from "@/types";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { formatChapterTitle } from "@/lib/utils/chapter";

type ChapterPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { slug: chapterSlug } = await params;
  const isCommunity = chapterSlug.startsWith("community-");
  let chapterTitle = "Chapter";
  let readableNovel = "Novel";

  if (isCommunity) {
    const dbChapter = await prisma.userChapter.findUnique({
      where: { slug: chapterSlug.replace("community-", "") },
      include: { novel: true }
    });
    if (dbChapter) {
      chapterTitle = dbChapter.title;
      readableNovel = dbChapter.novel.title;
    }
  } else {
    const chapterData = await getNovelResponse(`chapter/${chapterSlug}`);
    chapterTitle = chapterData?.chapter_title || "Chapter";
    const novelSlug = chapterSlug.substring(0, chapterSlug.lastIndexOf("-chapter-"));
    readableNovel = novelSlug.replace(/-/g, " ");
  }

  return {
    title: `${chapterTitle} - ${readableNovel} | NoctuaNovel`,
    description: `Read ${chapterTitle} of ${readableNovel} on NoctuaNovel.`,
  };
}

const Page = async ({ params }: ChapterPageProps) => {
  const { slug: chapterSlug } = await params;
  const isCommunity = chapterSlug.startsWith("community-");

  let chapterTitle = "";
  let content = "";
  let novelSlug = "";
  let novelTitle = "";
  let prevChapter = null;
  let nextChapter = null;

  if (isCommunity) {
    const cleanSlug = chapterSlug.replace("community-", "");
    const dbChapter = await prisma.userChapter.findUnique({
      where: { slug: cleanSlug },
      include: {
        novel: {
          include: { chapters: { orderBy: { orderIndex: "asc" } } }
        }
      }
    });

    if (!dbChapter) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-white text-xl">Chapter not found.</p>
        </div>
      );
    }

    chapterTitle = dbChapter.title;
    content = dbChapter.content;
    novelSlug = `community-${dbChapter.novel.slug}`;
    novelTitle = dbChapter.novel.title;

    const chapters = dbChapter.novel.chapters;
    const currentIndex = chapters.findIndex((ch) => ch.id === dbChapter.id);
    if (currentIndex > 0) {
      prevChapter = { slug: `community-${chapters[currentIndex - 1].slug}`, title: chapters[currentIndex - 1].title };
    }
    if (currentIndex < chapters.length - 1) {
      nextChapter = { slug: `community-${chapters[currentIndex + 1].slug}`, title: chapters[currentIndex + 1].title };
    }
  } else {
    const chapterData = await getNovelResponse(`chapter/${chapterSlug}`);

    if (!chapterData || !chapterData.content) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-white text-xl">Chapter not found.</p>
        </div>
      );
    }

    chapterTitle = chapterData.chapter_title;
    content = chapterData.content;
    novelSlug = chapterSlug.substring(0, chapterSlug.lastIndexOf("-chapter-"));
    novelTitle = novelSlug.replace(/-/g, " "); // rough fallback

    try {
      const novelDetail: NovelDetail = await getNovelResponse(`novel/${novelSlug}`);
      if (novelDetail?.title) {
        novelTitle = novelDetail.title;
      }
      if (novelDetail?.chapters) {
        const currentIndex = novelDetail.chapters.findIndex((ch) => ch.slug === chapterSlug);
        if (currentIndex > 0) {
          const prev = novelDetail.chapters[currentIndex - 1];
          prevChapter = { slug: prev.slug, title: formatChapterTitle(prev.chapter_full_title, novelTitle) };
        }
        if (currentIndex >= 0 && currentIndex < novelDetail.chapters.length - 1) {
          const next = novelDetail.chapters[currentIndex + 1];
          nextChapter = { slug: next.slug, title: formatChapterTitle(next.chapter_full_title, novelTitle) };
        }
      }
    } catch {
      // skip
    }
  }

  // Format the header title too
  const displayTitle = formatChapterTitle(chapterTitle, novelTitle);

  return (
    <ChapterClient
      chapterTitle={displayTitle}
      content={content}
      novelSlug={novelSlug}
      chapterSlug={chapterSlug}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
    />
  );
};

export default Page;
