"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings, Minus, Plus, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type ChapterClientProps = {
  chapterTitle: string;
  content: string;
  novelSlug: string;
};

const fontSizes = ["text-base", "text-lg", "text-xl", "text-2xl"];

const ChapterClient = ({ chapterTitle, content, novelSlug }: ChapterClientProps) => {
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const router = useRouter();

  const handleFontSizeChange = (direction: "increase" | "decrease") => {
    if (direction === "increase" && fontSizeIndex < fontSizes.length - 1) setFontSizeIndex(fontSizeIndex + 1);
    if (direction === "decrease" && fontSizeIndex > 0) setFontSizeIndex(fontSizeIndex - 1);
  };

  const formattedContent = content.split("\n").map((p, i) => (
    <p key={i} className="mb-6">
      {p}
    </p>
  ));

  return (
    <div className="bg-gray-950 min-h-screen text-gray-300 pt-12">
      <main className="container mx-auto px-4 md:px-8 lg:px-36">
        <header className="py-3 flex justify-between items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5 text-gray-900" />
          </Button>

          <h1 className="text-lg font-semibold text-white text-center flex-grow mx-4">{chapterTitle}</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild={false}>
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5 text-gray-900" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Reading Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">Font Size</DropdownMenuLabel>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <Button variant="outline" size="icon" onClick={() => handleFontSizeChange("decrease")}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-16 text-center">{fontSizes[fontSizeIndex].replace("text-", "").toUpperCase()}</span>
                  <Button variant="outline" size="icon" onClick={() => handleFontSizeChange("increase")}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <article className={`w-full max-w-4xl mx-auto leading-loose transition-all duration-200 ${fontSizes[fontSizeIndex]}`}>{formattedContent}</article>

        <div className="flex justify-center mt-12 pb-20">
          <Button variant="secondary" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chapter List
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ChapterClient;
