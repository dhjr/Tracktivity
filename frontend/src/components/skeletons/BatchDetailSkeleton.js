export default function BatchDetailSkeleton() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10">
        {/* Batch info Header Skeleton */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-4 w-full md:w-1/2">
            <div className="h-12 w-3/4 bg-secondary/20 rounded-2xl animate-pulse" />
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="h-10 w-32 bg-secondary/15 rounded-xl animate-pulse" />
              <div className="h-10 w-32 bg-secondary/15 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Nav cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[220px] bg-secondary/10 border border-border/30 rounded-4xl p-8 space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 bg-secondary/20 rounded-2xl animate-pulse shadow-sm" />
                </div>
                <div className="space-y-3">
                  <div className="h-6 w-1/2 bg-secondary/20 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-secondary/15 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-3 w-1/4 bg-secondary/10 rounded animate-pulse opacity-50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
