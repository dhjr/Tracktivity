"use client";

import { useStats } from "@/components/providers/StatsProvider";
import { Award } from "lucide-react";

export default function StudentBatchClient() {
  const { stats } = useStats();

  return (
    <div className="flex flex-wrap items-center gap-6 pt-2">
      <div className="flex items-center gap-2 bg-secondary/5 border border-border/30 px-3 py-1.5 rounded-xl backdrop-blur-sm">
        <Award className="w-4 h-4 text-green-500" />
        <span className="text-sm font-medium text-foreground/80">
          {stats.points}{" "}
          <span className="text-foreground/75 font-light">Points Earned</span>
        </span>
      </div>
      {stats.pendingCount > 0 && (
        <div className="flex items-center gap-2 bg-secondary/5 border border-border/30 px-3 py-1.5 rounded-xl backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-sm font-medium text-foreground/80">
            {stats.pendingCount}{" "}
            <span className="text-foreground/75 font-light">
              Pending Review
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
