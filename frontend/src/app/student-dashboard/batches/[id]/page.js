"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { use } from "react";
import { Users, FileText, PlusCircle, Award } from "lucide-react";
import BatchNavCard from "@/components/BatchNavCard";
import BatchDetailSkeleton from "@/components/skeletons/BatchDetailSkeleton";
import { useStats } from "@/components/providers/StatsProvider";

export default function StudentBatchDetailPage({ params }) {
  const { user, isReady } = useRequireRole("student");
  const { stats } = useStats();
  const { id: batchId } = use(params);

  if (!isReady) return <BatchDetailSkeleton />;

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10">

        {/* Batch info Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-2">
            <h1 className="text-5xl font-display font-bold tracking-tight text-foreground leading-[1.1]">
              Batch Overview
            </h1>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2 bg-secondary/5 border border-border/30 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                <Award className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-foreground/80">{stats.points} <span className="text-foreground/60 font-light">Points Earned</span></span>
              </div>
              {stats.pendingCount > 0 && (
                <div className="flex items-center gap-2 bg-secondary/5 border border-border/30 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-sm font-medium text-foreground/80">{stats.pendingCount} <span className="text-foreground/60 font-light">Pending Review</span></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nav cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <BatchNavCard
            href={`/student-dashboard/batches/${batchId}/members`}
            icon={<Users className="w-6 h-6" />}
            label="View Batch Members"
            description="See your classmates and their progress."
          />
          <BatchNavCard
            href={`/student-dashboard/batches/${batchId}/submissions`}
            icon={<FileText className="w-6 h-6" />}
            label="My Submissions"
            description="Review and track your activity point logs."
          />
          <BatchNavCard
            href={`/student-dashboard/batches/${batchId}/add-certificate`}
            icon={<PlusCircle className="w-6 h-6" />}
            label="Add New Submission"
            description="Submit certificates for activity points."
            variant="primary"
          />
        </div>
      </div>
    </div>
  );
}
