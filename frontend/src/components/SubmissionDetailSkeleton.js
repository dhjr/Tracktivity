import React from "react";

export default function SubmissionDetailSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 pb-8">
        {/* Left Column: Details Skeleton */}
        <div className="space-y-6">
          {/* Top extra info skeleton (e.g. Student Card) */}
          <div className="h-24 bg-secondary/10 border border-border/50" />

          {/* Main Detail Card Skeleton */}
          <div className="p-6 border border-border bg-background space-y-8">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-secondary/20" />
              <div className="h-10 w-full bg-secondary/10" />
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-2.5 w-16 bg-secondary/20" />
                  <div className="h-5 w-24 bg-secondary/10" />
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-border">
              <div className="h-3 w-32 bg-secondary/20 mb-2" />
              <div className="h-5 w-40 bg-secondary/10" />
            </div>
          </div>
          
          {/* Footer Area Skeleton */}
          <div className="h-40 bg-secondary/5 border border-border border-dashed" />
        </div>

        {/* Right Column: Certificate Preview Skeleton */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 bg-secondary/20 rounded-full" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-secondary/10 rounded-md" />
              <div className="h-8 w-8 bg-secondary/10 rounded-md" />
            </div>
          </div>
          <div className="grow w-full border border-border bg-black/5 min-h-[500px]" />
        </div>
      </div>
    </div>
  );
}
