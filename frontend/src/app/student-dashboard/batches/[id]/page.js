"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { getAuthHeaders } from "@/utils/api";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Users, FileText, PlusCircle, Award, ArrowLeft, ChevronRight, Activity } from "lucide-react";
import BatchNavCard from "@/components/BatchNavCard";
import PageLoader from "@/components/PageLoader";

export default function StudentBatchDetailPage({ params }) {
  const { user, isReady } = useRequireRole("student");
  const { id: batchId } = use(params);

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (isReady) fetchBatchDetails();
  }, [isReady, batchId]);

  const fetchBatchDetails = async () => {
    setLoading(true);
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const [batchRes, summaryRes] = await Promise.all([
        fetch(`${API_URL}/batches/${batchId}`, { headers }),
        fetch(`${API_URL}/student/dashboard?view=summary`, { headers }),
      ]);
      if (batchRes.ok) {
        const batchData = await batchRes.json();
        setBatch({ ...batchData, enrolled_at: batchData.created_at });
      }
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setTotalPoints(summaryData.total_approved_points || 0);
        setPendingCount(summaryData.pending_count || 0);
      }
    } catch (err) {
      console.error("Error fetching batch details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) return <PageLoader />;

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10">
        {/* Breadcrumbs */}
        <div className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50 animate-in fade-in slide-in-from-left-4 duration-500">
           <Link href="/student-dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
           <ChevronRight className="w-3 h-3" />
           <span className="text-foreground/80">{batch?.name || "Batch Details"}</span>
        </div>

        {/* Back Button */}
        <Link 
          href="/student-dashboard" 
          className="inline-flex items-center gap-2 mb-6 text-xs font-medium text-foreground/60 hover:text-foreground transition-all group"
        >
          <div className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center group-hover:bg-secondary/10 group-hover:border-border transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Overview
        </Link>

        {/* Batch info Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
               <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-background" />
               </div>
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60">Batch Portal</span>
            </div>
            <h1 className="text-5xl font-display font-bold tracking-tight text-foreground leading-[1.1]">
              {batch?.name}
            </h1>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2 bg-secondary/5 border border-border/30 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                <Award className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-foreground/80">{totalPoints} <span className="text-foreground/60 font-light">Points Earned</span></span>
              </div>
              {pendingCount > 0 && (
                <div className="flex items-center gap-2 bg-secondary/5 border border-border/30 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-sm font-medium text-foreground/80">{pendingCount} <span className="text-foreground/60 font-light">Pending Review</span></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nav cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
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

        {/* Optional: Batch Quick Stats or Recent Activity Placeholder */}
        <div className="mt-20 p-10 border border-border/30 border-dashed rounded-[2.5rem] bg-secondary/5 backdrop-blur-sm flex flex-col items-center justify-center text-center group hover:border-border/60 transition-all duration-500">
           <div className="w-16 h-16 rounded-full bg-background border border-border/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-8 h-8 text-foreground/30" />
           </div>
           <h3 className="text-lg font-display font-medium text-foreground/80 mb-2">Track your growth</h3>
           <p className="text-sm text-foreground/50 font-light max-w-md">Every submission brings you closer to your graduation requirement. Keep pushing!</p>
        </div>
      </div>

    </div>
  );
}
