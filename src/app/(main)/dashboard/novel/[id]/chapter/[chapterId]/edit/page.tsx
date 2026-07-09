import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ChapterEditor from "@/components/dashboard/ChapterEditor";

export default async function EditChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id, chapterId } = await params;

  const chapter = await prisma.userChapter.findFirst({
    where: { id: chapterId, novelId: id, novel: { userId } },
    select: {
      id: true,
      title: true,
      content: true,
      orderIndex: true,
      isDraft: true,
      isLocked: true,
      coinPrice: true,
      scheduledAt: true,
      novel: { select: { id: true, title: true } },
    },
  });

  if (!chapter) redirect("/dashboard");

  return (
    <div className="bg-gray-950 text-white min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6 md:px-16 lg:px-36">
        <Link href={`/dashboard/novel/${id}`} className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to {chapter.novel.title}
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-8">Edit Chapter</h1>
          <ChapterEditor
            novelId={id}
            chapter={{
              id: chapter.id,
              title: chapter.title,
              content: chapter.content,
              orderIndex: chapter.orderIndex,
              isDraft: chapter.isDraft,
              isLocked: chapter.isLocked,
              coinPrice: chapter.coinPrice,
              scheduledAt: chapter.scheduledAt?.toISOString() ?? null,
            }}
          />
        </div>
      </div>
    </div>
  );
}
