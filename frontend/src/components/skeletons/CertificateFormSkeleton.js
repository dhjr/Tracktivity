export default function CertificateFormSkeleton() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto p-4 md:px-10 md:py-8 flex flex-col">
        {/* Header Skeleton */}
        <div className="mb-8 w-1/3 h-12 bg-secondary/20 rounded-2xl animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-7">
            <div className="p-6 md:p-8 bg-background border border-border space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="h-3 w-1/2 bg-secondary/10 rounded animate-pulse" />
                  <div className="h-10 w-full bg-secondary/15 rounded-xl animate-pulse" />
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-1/2 bg-secondary/10 rounded animate-pulse" />
                  <div className="h-10 w-full bg-secondary/15 rounded-xl animate-pulse" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="h-3 w-1/2 bg-secondary/10 rounded animate-pulse" />
                  <div className="h-10 w-full bg-secondary/15 rounded-xl animate-pulse" />
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-1/2 bg-secondary/10 rounded animate-pulse" />
                  <div className="h-10 w-full bg-secondary/15 rounded-xl animate-pulse" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="h-3 w-1/2 bg-secondary/10 rounded animate-pulse" />
                  <div className="h-10 w-full bg-secondary/15 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="h-3 w-1/3 bg-secondary/10 rounded animate-pulse" />
              <div className="h-[400px] w-full bg-secondary/5 border-2 border-dashed border-border/50 rounded-2xl animate-pulse" />
            </div>

            {/* Buttons Skeleton */}
            <div className="flex items-center gap-4 mt-6">
              <div className="h-12 w-24 bg-secondary/10 rounded animate-pulse" />
              <div className="h-12 w-48 bg-secondary/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
