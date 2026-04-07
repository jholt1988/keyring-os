export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-7 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
      </header>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-full animate-pulse rounded bg-muted" />
            <div className="mt-4 flex gap-2">
              <div className="h-7 w-24 animate-pulse rounded-lg bg-muted" />
              <div className="h-7 w-24 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
