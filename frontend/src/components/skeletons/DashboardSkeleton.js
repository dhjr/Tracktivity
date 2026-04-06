export default function DashboardSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10">
        {/* Header Skeleton */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="h-10 w-64 bg-secondary/20 rounded-2xl animate-pulse" />
            <div className="h-6 w-32 bg-secondary/15 rounded-xl animate-pulse" />
          </div>
          <div className="h-12 w-12 rounded-2xl bg-secondary/10 animate-pulse hidden md:block" />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-end">
             <div className="h-10 w-32 bg-secondary/20 rounded-lg animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Create Batch Card Skeleton */}
            <div className="p-8 bg-secondary/5 border border-border/50 rounded-3xl h-[250px] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-secondary/20 rounded-lg animate-pulse" />
                  <div className="h-6 w-32 bg-secondary/20 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-secondary/15 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-secondary/15 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-3">
                 <div className="h-10 w-full bg-secondary/10 rounded-2xl animate-pulse" />
                 <div className="h-12 w-full bg-secondary/20 rounded-2xl animate-pulse" />
              </div>
            </div>

            {/* Join Batch card skeleton */}
            <div className="p-8 bg-secondary/5 border border-border/50 rounded-3xl h-[250px] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <div className="h-8 w-8 bg-secondary/20 rounded-lg animate-pulse" />
                   <div className="h-6 w-32 bg-secondary/20 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                   <div className="h-3 w-full bg-secondary/15 rounded animate-pulse" />
                   <div className="h-3 w-3/4 bg-secondary/15 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-3">
                 <div className="h-10 w-full bg-secondary/10 rounded-2xl animate-pulse" />
                 <div className="h-12 w-full bg-secondary/20 rounded-2xl animate-pulse" />
              </div>
            </div>

            {/* Existing Batch card skeletons */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-8 bg-secondary/5 border border-border/50 rounded-3xl h-[250px] flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-1/2 bg-secondary/20 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-secondary/15 rounded-full animate-pulse" />
                  </div>
                  <div className="h-8 w-24 bg-secondary/15 rounded animate-pulse" />
                </div>
                <div className="h-4 w-1/3 bg-secondary/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
