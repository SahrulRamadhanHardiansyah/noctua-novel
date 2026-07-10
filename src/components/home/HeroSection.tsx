"use client";

import React from "react";
import { ArrowRightIcon, CalendarIcon, ShieldAlert } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const HeroSection = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleExploreClick = () => {
    if (pathname === "/") {
      const targetElement = document.getElementById("latest");
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push("/#latest");
    }
  };

  return (
    <div className='relative flex flex-col items-start justify-center bg-[url("/backgroundImage.png")] bg-cover bg-center h-screen'>
      <div className="relative z-10 flex flex-col items-start justify-center gap-3 sm:gap-4 h-full px-4 sm:px-6 md:px-16 lg:px-36">
        <img src="/lotmLogo.png" alt="Lord of The Mysteries Logo" className="h-8 sm:max-h-11 w-16 sm:w-18 lg:h-11 mt-16 sm:mt-20" />

        <h1 className="text-3xl sm:text-5xl md:text-[70px] md:leading-tight text-gray-100 font-semibold max-w-2xl">
          Lord <br /> of The Mysteries
        </h1>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-100 text-xs sm:text-sm">
          <span>Dark Fantasy | Steampunk | Lovecraftian Horror</span>
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" /> 2018
          </div>
          <div className="flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" /> 14+
          </div>
        </div>
        <p className="max-w-md text-sm sm:text-base text-gray-100">
          In a Victorian world of steam, dreadnoughts, and occult horrors, Zhou Mingrui awakens as Klein Moretti. He walks a razor&apos;s edge between light and darkness, entangled with warring Churches. This is the legend of unlimited
          potential…and unspeakable danger.
        </p>
        <button onClick={handleExploreClick} className="flex items-center gap-1 px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20 transition rounded-full font-medium cursor-pointer">
          Explore Novel <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none"></div>
    </div>
  );
};

export default HeroSection;
