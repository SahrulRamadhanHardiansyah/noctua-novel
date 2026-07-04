import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import EditNovelForm from "./EditNovelForm";

export default async function EditNovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const novel = await prisma.userNovel.findUnique({
    where: { id, userId },
  });

  if (!novel) redirect("/dashboard");

  return <EditNovelForm novel={novel} />;
}
