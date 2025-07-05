import React from "react";
import SearchResults from "@/components/search/SearchResults";

type Props = {
  params: { keyword: string };
};

const Page = ({ params }: Props) => {
  const { keyword } = params;

  return <SearchResults keyword={keyword} />;
};

export default Page;
