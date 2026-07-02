import React from "react";
import LatestSection from "@/components/home/LatestSection";
import EditorsChoiceSection from "@/components/home/EditorsChoiceSection";
import RecommendationSection from "@/components/home/RecommendationSection";
import HeroSection from "@/components/home/HeroSection";
import { getNovelResponse } from "@/lib/api-libs";
import QuoteSection from "@/components/QuoteSection";
import { Novel } from "@/types";

const Page = async () => {
  const [latestNovels, recommendedNovels, editorsChoice] = await Promise.all([
    getNovelResponse<Novel[]>("terbaru"),
    getNovelResponse<Novel[]>("rekomendasi"),
    getNovelResponse<Novel[]>("pilihan-editor"),
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
