export function FullPageSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar placeholder */}
      <div className="hidden md:flex w-64 shrink-0 border-r border-border flex-col gap-2 p-4">
        <div className="h-10 w-32 rounded-xl bg-white/5 animate-pulse mb-4" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-9 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="h-14 border-b border-border bg-white/2 animate-pulse" />
        <div className="flex-1 p-6 space-y-4">
          <div className="h-8 w-48 rounded-lg bg-white/5 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
