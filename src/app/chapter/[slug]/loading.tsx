export default function ChapterLoading() {
  return (
    <div className="bg-gray-950 min-h-screen text-gray-300 pt-12">
      <main className="container mx-auto px-4 md:px-8 lg:px-36">
        <header className="py-3 flex justify-between items-center gap-4 mb-8">
          <div className="h-10 w-10 bg-gray-800 rounded animate-pulse" />
          <div className="h-6 bg-gray-800 rounded animate-pulse flex-grow mx-4 max-w-md" />
          <div className="h-10 w-10 bg-gray-800 rounded animate-pulse" />
        </header>
        <article className="w-full max-w-4xl mx-auto space-y-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-gray-800 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-800 rounded animate-pulse w-11/12" />
              <div className="h-4 bg-gray-800 rounded animate-pulse w-4/5" />
            </div>
          ))}
        </article>
      </main>
    </div>
  );
}
