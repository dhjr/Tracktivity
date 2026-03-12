"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { getAuthHeaders } from "@/utils/api";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Users, FileText, PlusCircle, Award } from "lucide-react";
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
