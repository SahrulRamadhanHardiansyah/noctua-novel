import React from "react";
import LatestSection from "@/components/home/LatestSection";
import EditorsChoiceSection from "@/components/home/EditorsChoiceSection";
import RecommendationSection from "@/components/home/RecommendationSection";
import CommunityNovelsSection from "@/components/home/CommunityNovelsSection";
import HeroSection from "@/components/home/HeroSection";
import { getNovelResponse } from "@/lib/api-libs";
import QuoteSection from "@/components/QuoteSection";
import { Novel } from "@/types";
import prisma from "@/lib/prisma";

const Page = async () => {
  const [latestNovels, recommendedNovels, editorsChoice, communityNovels] = await Promise.all([
    getNovelResponse<Novel[]>("terbaru"),
    getNovelResponse<Novel[]>("rekomendasi"),
    getNovelResponse<Novel[]>("pilihan-editor"),
    prisma.userNovel.findMany({
      where: { status: "Ongoing" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        _count: { select: { chapters: true } },
      },
    }),
  ]);

  const limitedLatestNovels = latestNovels.slice(0, 13);

  return (
    <main>
      <section>
        <HeroSection />
      </section>

      <section id="latest">
        <LatestSection apiData={limitedLatestNovels} />
      </section>

      <section id="community-originals">
        <CommunityNovelsSection novels={communityNovels} />
      </section>

      <section id="editors-choice">
        <EditorsChoiceSection apiData={editorsChoice} />
      </section>

      <section id="recommendation">
        <RecommendationSection apiData={recommendedNovels} />
      </section>

      <QuoteSection />
    </main>
  );
};

export default Page;
