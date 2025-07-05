import { NovelDetailClient } from "@/components/NovelDetailClient";
import React from "react";

type Props = {
  params: { slug: string };
};

const Page = ({ params }: Props) => {
  const { slug } = params;

  return <NovelDetailClient slug={slug} />;
};

export default Page as any;
