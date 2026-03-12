"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Loader2, Users, FileText, PlusCircle, Award } from "lucide-react";
import BatchNavCard from "@/components/BatchNavCard";

export default function StudentBatchDetailPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const { id: batchId } = use(params);

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (
      user?.user_metadata?.role !== "student" &&
      user?.user_metadata?.role !== undefined
    ) {
      router.push("/faculty-dashboard");
    } else {
      fetchBatchDetails();
    }
  }, [user, router, batchId]);

  const fetchBatchDetails = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const headers = { Authorization: `Bearer ${session?.access_token}` };

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

  if (!user || loading) {
    return (
      <div className="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-5xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/student-dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {/* Batch info */}
      <div className="mb-8 border-b border-border pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">
            {batch?.name}
          </h1>
          <div className="flex items-center gap-6 mt-2">
            <p className="text-sm text-foreground/60 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-green-500" />
              <span className="font-medium text-green-500">{totalPoints}</span>
              <span>points earned</span>
            </p>
            {pendingCount > 0 && (
              <p className="text-sm text-foreground/60 flex items-center gap-1.5">
                <span className="font-medium text-yellow-500">{pendingCount}</span>
                <span>pending</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Nav cards */}
      <div className="flex flex-wrap items-center justify-center gap-6 py-12">
        <BatchNavCard
          href={`/student-dashboard/batches/${batchId}/members`}
          icon={<Users className="w-8 h-8" />}
          label="View Members"
        />
        <BatchNavCard
          href={`/student-dashboard/batches/${batchId}/submissions`}
          icon={<FileText className="w-8 h-8" />}
          label="My Submissions"
        />
        <BatchNavCard
          href={`/student-dashboard/batches/${batchId}/add-certificate`}
          icon={<PlusCircle className="w-8 h-8" />}
          label="Add Submission"
          variant="primary"
        />
      </div>
    </div>
  );
}
