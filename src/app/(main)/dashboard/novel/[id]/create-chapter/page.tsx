import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ChapterEditor from "@/components/dashboard/ChapterEditor";

export default async function CreateChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const novel = await prisma.userNovel.findUnique({
    where: { id, userId },
    select: { id: true, title: true },
  });

  if (!novel) redirect("/dashboard");

  return (
    <div className="bg-gray-950 text-white min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6 md:px-16 lg:px-36">
        <Link href={`/dashboard/novel/${novel.id}`} className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to {novel.title}
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-8">Write New Chapter</h1>
          <ChapterEditor novelId={novel.id} />
        </div>
      </div>
    </div>
  );
}
