export default function NovelLoading() {
  return (
    <div className="bg-black text-white min-h-screen">
      <section className="relative pt-40 pb-16">
        <div className="container mx-auto px-6 md:px-16 lg:px-36 flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
          <div className="w-48 md:w-1/4 flex-shrink-0">
            <div className="rounded-lg w-full aspect-[3/4] bg-gray-800 animate-pulse" />
          </div>
          <div className="w-full md:w-3/4 flex flex-col gap-4">
            <div className="h-12 bg-gray-800 rounded animate-pulse w-3/4" />
            <div className="flex gap-4">
              <div className="h-6 bg-gray-800 rounded animate-pulse w-20" />
              <div className="h-6 bg-gray-800 rounded animate-pulse w-24" />
              <div className="h-6 bg-gray-800 rounded animate-pulse w-28" />
            </div>
            <div className="h-10 bg-gray-800 rounded animate-pulse w-40 mt-2" />
            <div className="flex gap-2 mt-2">
              <div className="h-6 bg-gray-800 rounded-full animate-pulse w-16" />
              <div className="h-6 bg-gray-800 rounded-full animate-pulse w-20" />
              <div className="h-6 bg-gray-800 rounded-full animate-pulse w-18" />
            </div>
            <div className="mt-4 space-y-3">
              <div className="h-6 bg-gray-800 rounded animate-pulse w-32" />
              <div className="h-4 bg-gray-800 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-800 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
