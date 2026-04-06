import { Users } from "lucide-react";

export default function MemberListSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10">
        <div className="mb-12">
          <div className="h-12 w-64 bg-secondary/20 rounded-2xl animate-pulse mb-2" />
          <div className="h-6 w-32 bg-secondary/15 rounded-lg animate-pulse" />
        </div>

        <div className="flex flex-col gap-3 max-w-4xl mx-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-full relative flex items-center gap-4 p-4 rounded-3xl bg-background/40 border border-border/50 backdrop-blur-md"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/20 border border-border/50 animate-pulse shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-1/3 bg-secondary/20 rounded animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="h-3 w-1/4 bg-secondary/15 rounded animate-pulse" />
                  <div className="h-1 w-1 rounded-full bg-border" />
                  <div className="h-4 w-16 bg-secondary/15 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
