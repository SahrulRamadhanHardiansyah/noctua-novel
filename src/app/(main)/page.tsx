import React from "react";
import LatestSection from "@/components/home/LatestSection";
import EditorsChoiceSection from "@/components/home/EditorsChoiceSection";
import RecommendationSection from "@/components/home/RecommendationSection";
import HeroSection from "@/components/home/HeroSection";
import { getNovelResponse } from "@/lib/api-libs";
import QuoteSection from "@/components/QuoteSection";

const page = async () => {
  const latestNovels = await getNovelResponse("terbaru");
  const limitedLatestNovels = latestNovels.slice(0, 13);
  const recommendedNovels = await getNovelResponse("rekomendasi");
  const editorsChoice = await getNovelResponse("pilihan-editor");

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

export default page;
