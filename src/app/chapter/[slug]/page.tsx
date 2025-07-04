import React from "react";
import { getNovelResponse } from "@/lib/api-libs";
import ChapterClient from "@/components/ChapterClient";

type ChapterPageProps = {
  params: { slug: string };
};

const Page = async ({ params }: ChapterPageProps) => {
  const { slug: chapterSlug } = params;
  const chapterData = await getNovelResponse(`chapter/${chapterSlug}`);

  if (!chapterData || !chapterData.content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p>Chapter not found.</p>
      </div>
    );
  }

  const novelSlug = chapterSlug.substring(0, chapterSlug.lastIndexOf("-chapter-"));

  return <ChapterClient chapterTitle={chapterData.chapter_title} content={chapterData.content} novelSlug={novelSlug} />;
};

export default Page;
