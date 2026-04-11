export default function Loading() {
  return (
    <main className="mx-auto max-w-[1440px] px-6 py-8">
      <header className="mb-8">
        <div className="h-4 w-24 animate-pulse rounded-[10px] bg-[#0F1B31]" />
        <div className="mt-2 h-7 w-40 animate-pulse rounded-[10px] bg-[#0F1B31]" />
        <div className="mt-2 h-4 w-48 animate-pulse rounded-[10px] bg-[#0F1B31]" />
      </header>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[24px] border border-[#1E3350] bg-[#13233C] p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="h-5 w-16 animate-pulse rounded-full bg-[#0F1B31]" />
              <div className="h-4 w-16 animate-pulse rounded-[10px] bg-[#0F1B31]" />
            </div>
            <div className="h-4 w-3/4 animate-pulse rounded-[10px] bg-[#0F1B31]" />
            <div className="mt-2 h-3 w-full animate-pulse rounded-[10px] bg-[#0F1B31]" />
            <div className="mt-4 flex gap-2">
              <div className="h-7 w-24 animate-pulse rounded-[14px] bg-[#0F1B31]" />
              <div className="h-7 w-24 animate-pulse rounded-[14px] bg-[#0F1B31]" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
