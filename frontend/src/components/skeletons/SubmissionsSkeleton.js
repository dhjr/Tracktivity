export default function SubmissionsSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10">
        {/* Header Skeleton */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-4 w-full md:w-1/2">
            <div className="h-4 w-32 bg-secondary/15 rounded animate-pulse" />
            <div className="h-12 w-3/4 bg-secondary/20 rounded-2xl animate-pulse" />
          </div>
          <div className="h-12 w-48 bg-secondary/20 rounded animate-pulse" />
        </div>

        {/* Tab Bar Skeleton */}
        <div className="flex items-center gap-2 mb-8 p-1 bg-secondary/10 w-fit rounded-none border border-border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 bg-secondary/15 animate-pulse" />
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="border border-border rounded-none overflow-hidden bg-background">
          <div className="bg-secondary/20 h-12 border-b border-border flex items-center px-4 gap-4">
             {[1, 2, 3, 4, 5].map(i => (
               <div key={i} className="h-3 w-20 bg-secondary/20 rounded animate-pulse" />
             ))}
          </div>
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-1/2 bg-secondary/20 rounded animate-pulse" />
                  <div className="h-3 w-1/4 bg-secondary/10 rounded animate-pulse" />
                </div>
                <div className="h-5 w-12 bg-secondary/20 rounded animate-pulse" />
                <div className="h-6 w-20 bg-secondary/15 rounded-full animate-pulse" />
                <div className="h-4 w-24 bg-secondary/10 rounded animate-pulse" />
                <div className="h-5 w-20 bg-secondary/10 rounded animate-pulse hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
