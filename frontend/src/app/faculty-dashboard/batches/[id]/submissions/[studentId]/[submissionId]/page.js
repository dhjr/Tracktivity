"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { getAuthHeaders } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  FileText,
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import SubmissionDetailSkeleton from "@/components/SubmissionDetailSkeleton";
import SubmissionDetailView from "@/components/SubmissionDetailView";
import { useStats } from "@/components/providers/StatsProvider";

export default function SubmissionReviewPage({ params }) {
  const { user, isReady } = useRequireRole("faculty");
  const { refreshStats } = useStats();
  const router = useRouter();
  const { id: batchId, studentId, submissionId } = use(params);

  const [submission, setSubmission] = useState(null);
  const [rule, setRule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (isReady) fetchSubmissionDetail();
  }, [isReady, submissionId]);

  const fetchSubmissionDetail = async () => {
    setLoading(true);
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const res = await fetch(
        `${API_URL}/faculty/submissions/${submissionId}`,
        { headers },
      );
      if (!res.ok) throw new Error("Failed to fetch submission details");
      const data = await res.json();
      setSubmission(data.submission);
      setRule(data.rule);
      setComment(data.submission.comments || "");
    } catch (err) {
      console.error("Error fetching submission details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSub = async (updatedData) => {
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const formData = new FormData();
      
      // Basic fields
      if (updatedData.activity_id) formData.append("activity_id", updatedData.activity_id);
      if (updatedData.group_name) formData.append("group_name", updatedData.group_name);
      if (updatedData.points_awarded !== undefined) formData.append("points_awarded", updatedData.points_awarded);
      if (updatedData.academic_year) formData.append("academic_year", updatedData.academic_year);
      if (updatedData.level) formData.append("level", updatedData.level);
      if (updatedData.certificate_date) formData.append("certificate_date", updatedData.certificate_date);
      
      // File update
      if (updatedData.newFile) {
        formData.append("file", updatedData.newFile);
      }

      const res = await fetch(
        `${API_URL}/faculty/submissions/${submissionId}`,
        {
          method: "PATCH",
          headers: { ...headers }, // multipart/form-data boundary is handled automatically
          body: formData,
        },
      );
      if (res.ok) {
        // Refresh local state to ensure consistency
        await fetchSubmissionDetail();
      } else {
        const err = await res.json();
        throw new Error(err.detail || "Failed to save corrections");
      }
    } catch (err) {
      console.error("Error saving corrections:", err);
      alert(`Error: ${err.message}`);
      throw err; // Re-throw to let SubmissionDetailView know it failed
    }
  };

  const handleVerify = async (status) => {
    setVerifying(true);
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const res = await fetch(
        `${API_URL}/faculty/submissions/${submissionId}/verify`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ 
            status, 
            comments: comment,
            activity_id: submission.activity_id,
            points_awarded: submission.points_awarded,
            academic_year: submission.academic_year,
            level: submission.level,
            group_name: submission.group_name
          }),
        },
      );
      if (res.ok) {
        await refreshStats();
        router.push(
          `/faculty-dashboard/batches/${batchId}/submissions/${studentId}`,
        );
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || "Failed to verify submission"}`);
      }
    } catch (err) {
      console.error("Error verifying submission:", err);
    } finally {
      setVerifying(false);
    }
  };

  // If we have a submission, we can show it regardless of loading state
  // If we are loading and don't have a submission yet, show the skeleton
  if (loading && !submission) return <SubmissionDetailSkeleton />;
  
  // Also show skeleton while waiting for auth readiness
  if (!isReady && !submission) return <SubmissionDetailSkeleton />;

  if (!submission) {
    return (
      <div className="min-h-[calc(100vh-6rem)] w-full flex flex-col items-center justify-center gap-4">
        <p className="text-foreground/50">Submission not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full relative bg-background p-4 md:p-8">
      <SubmissionDetailView
        submission={submission}
        rule={rule}
        userRole="faculty"
        onUpdate={handleUpdateSub}
        extraInfo={
          <section className="mb-8">
            <div className="p-6 border border-border bg-background shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold">
                    Student name
                  </p>
                  <h3 className="font-bold text-xl text-foreground">
                    {submission.student?.full_name}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-border/50">
                <div>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1.5 font-bold">
                    KTU ID
                  </p>
                  <p className="font-mono text-sm bg-secondary/10 px-2 py-0.5 inline-block border border-border/30">
                    {submission.student?.ktuid}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1.5 font-bold">
                    Department
                  </p>
                  <p className="text-sm font-medium">
                    {submission.student?.department}
                  </p>
                </div>
              </div>
            </div>
          </section>
        }
        footer={
          <section className="space-y-6">
            <div>
              <label
                htmlFor="comment"
                className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-2 flex items-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Review Comments (Optional)
              </label>
              <textarea
                id="comment"
                rows={3}
                placeholder="Ex: Activity code corrected. Points adjusted as per level."
                className="w-full px-4 py-3 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors resize-none italic"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <button
                disabled={verifying}
                onClick={() => handleVerify("rejected")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white hover:bg-red-600 text-sm font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-red-900/20 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button
                disabled={verifying}
                onClick={() => handleVerify("approved")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white hover:bg-green-700 text-sm font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-green-900/20 disabled:opacity-50"
              >
                {verifying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Approve
              </button>
            </div>
          </section>
        }
      />
    </div>
  );
}
