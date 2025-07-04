import React from "react";

const QuoteSection = () => {
  return (
    <div className="bg-gray-950 text-white">
      <div className="container mx-auto py-40 px-6 md:px-16 lg:px-36 text-center">
        <blockquote className="text-2xl md:text-3xl lg:text-4xl font-medium italic text-gray-300 max-w-4xl mx-auto">"Dalam kegelapan terdalam sekalipun, selalu ada setitik cahaya pengetahuan yang layak diperjuangkan."</blockquote>
        <cite className="block text-gray-400 mt-6 text-lg not-italic">— The Keeper of Lost Tomes</cite>
      </div>
    </div>
  );
};

export default QuoteSection;
