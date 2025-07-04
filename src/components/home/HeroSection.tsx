"use client";

import React from "react";
import { ArrowRightIcon, CalendarIcon, ClockIcon, ShieldAlert } from "lucide-react";

const HeroSection = () => {
  const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className='relative flex flex-col items-start justify-center bg-[url("/backgroundImage.png")] bg-cover bg-center h-screen'>
      <div className="relative z-10 flex flex-col items-start justify-center gap-4 h-full px-6 md:px-16 lg:px-36">
        <img src="/lotmLogo.png" alt="" className="max-h-11 w-18 lg:h-11 mt-20" />

        <h1 className="text-5xl md:text-[70px] md:leading-tight text-gray-100 font-semibold max-w-2xl">
          Lord <br /> of The Mysteries
        </h1>

        <div className="flex items-center gap-4 text-gray-100">
          <span>Dark Fantasy | Steampunk | Lovecraftian Horror</span>
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4.5 h-4.5" /> 2018
          </div>
          <div className="flex items-center gap-1">
            <ShieldAlert className="w-4.5 h-4.5" /> 14+
          </div>
        </div>
        <p className="max-w-md text-gray-100">
          In a Victorian world of steam, dreadnoughts, and occult horrors, Zhou Mingrui awakens as Klein Moretti. He walks a razor’s edge between light and darkness, entangled with warring Churches. This is the legend of unlimited
          potential…and unspeakable danger.
        </p>
        <a onClick={(e) => handleScrollClick(e, "latest")} className="flex items-center gap-1 px-6 py-3 text-sm bg-gray-100 hover:bg-gray-400 transition rounded-full font-medium cursor-pointer">
          Explore Novel <ArrowRightIcon className="w-5 h-5" />
        </a>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
    </div>
  );
};

export default HeroSection;
