export default function ReportsSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full relative overflow-hidden bg-background">
      {/* Decorative Background Elements - Hidden on mobile for performance */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[80px] pointer-events-none hidden md:block" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[80px] pointer-events-none hidden md:block" />

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10">
        {/* Header Section Skeleton */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-4 w-full md:w-1/2">
            <div className="h-12 w-3/4 bg-secondary/20 rounded-2xl animate-pulse" />
            <div className="h-4 w-1/2 bg-secondary/15 rounded-lg animate-pulse" />
          </div>

          <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
             <div className="w-full md:w-64 h-12 bg-secondary/15 rounded-2xl animate-pulse" />
             <div className="w-full md:w-48 h-12 bg-secondary/15 rounded-2xl animate-pulse" />
          </div>
        </div>

        {/* Reports Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-8 bg-secondary/5 border border-border/50 rounded-4xl h-[320px] flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="h-12 w-12 bg-secondary/20 rounded-2xl animate-pulse" />
                <div className="space-y-3">
                  <div className="h-6 w-3/4 bg-secondary/20 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-secondary/15 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex gap-3 pt-6 border-t border-border/20">
                <div className="flex-1 h-12 bg-secondary/15 rounded-xl animate-pulse" />
                <div className="flex-1 h-12 bg-secondary/20 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
