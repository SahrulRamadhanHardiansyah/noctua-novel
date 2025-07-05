import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getNovelResponse } from "@/lib/api-libs";
import { Novel } from "@/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FavoriteClientPage } from "@/components/FavoriteClientPage";
import { UserCommentSection } from "@/components/UserCommentSection";

const FavoritePage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const favoriteRecords = await prisma.favorite.findMany({
    where: { userId },
    select: { novelSlug: true },
  });

  const favoriteNovelsPromises = favoriteRecords.map(async (fav) => {
    const novelData = await getNovelResponse(`novel/${fav.novelSlug}`);
    return {
      ...novelData,
      slug: fav.novelSlug,
      url: `https://bacalightnovel.co/series/${fav.novelSlug}/`,
    } as Novel;
  });
  const initialFavoriteNovels = await Promise.all(favoriteNovelsPromises);

  return (
    <div className="bg-black text-white min-h-screen pt-32">
      <header className="container mx-auto px-6 md:px-16 lg:px-36 mb-8 flex items-center gap-4">
        <Link href="/" passHref>
          <ArrowLeft className="w-8 h-8 cursor-pointer hover:text-gray-400" />
        </Link>
        <h1 className="text-4xl font-bold text-white">Favorite Novels</h1>
      </header>

      <FavoriteClientPage initialFavoriteNovels={initialFavoriteNovels} />

      <div className="container mx-auto pb-20 px-6 md:px-16 lg:px-36 mt-16 pt-12 border-t border-gray-800">
        <UserCommentSection />
      </div>
    </div>
  );
};

export default FavoritePage;
