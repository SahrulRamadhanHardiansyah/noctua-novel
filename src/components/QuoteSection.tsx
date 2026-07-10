import React from "react";

const QuoteSection = () => {
  return (
    <div className="bg-[#09090b] text-white">
      <div className="container mx-auto py-40 px-6 md:px-16 lg:px-36 text-center">
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute -inset-x-10 -inset-y-6 bg-violet-500/5 rounded-3xl blur-2xl pointer-events-none" />
          <blockquote className="relative text-2xl md:text-3xl lg:text-4xl font-medium italic text-zinc-300 border-l-2 border-violet-500/30 pl-6 text-left">
            "Dalam kegelapan terdalam sekalipun, selalu ada setitik cahaya pengetahuan yang layak diperjuangkan."
          </blockquote>
          <cite className="relative block text-violet-400/70 mt-6 text-lg not-italic">— The Keeper of Lost Tomes</cite>
        </div>
      </div>
    </div>
  );
};

export default QuoteSection;
