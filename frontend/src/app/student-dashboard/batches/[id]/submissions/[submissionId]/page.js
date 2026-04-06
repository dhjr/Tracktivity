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
  Clock,
} from "lucide-react";
import PageLoader from "@/components/PageLoader";
import SubmissionDetailView from "@/components/SubmissionDetailView";
import SubmissionDetailSkeleton from "@/components/SubmissionDetailSkeleton";

export default function StudentSubmissionDetailPage({ params }) {
  const { user, isReady } = useRequireRole("student");
  const router = useRouter();
  const { id: batchId, submissionId } = use(params);

  const [submission, setSubmission] = useState(null);
  const [rule, setRule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady) fetchSubmissionDetail();
  }, [isReady, submissionId]);

  const handleInlineUpdate = async (updatedData) => {
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const formData = new FormData();
      formData.append("activity_code", updatedData.activity_id);
      formData.append("group_name", updatedData.group_name);
      formData.append("points_awarded", updatedData.points_awarded);
      formData.append("academic_year", updatedData.academic_year);
      if (updatedData.level) formData.append("level_key", updatedData.level);
      if (updatedData.newFile) formData.append("file", updatedData.newFile);

      const res = await fetch(`${API_URL}/student/submissions/${submissionId}`, {
        method: "PUT",
        headers: { ...headers },
        body: formData,
      });

      if (res.ok) {
        await fetchSubmissionDetail();
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || "Failed to update submission"}`);
      }
    } catch (err) {
      console.error("Error updating submission:", err);
    }
  };

  const fetchSubmissionDetail = async () => {
    setLoading(true);
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const res = await fetch(`${API_URL}/student/submissions/${submissionId}`, { headers });
      if (!res.ok) throw new Error("Failed to fetch submission details");
      const data = await res.json();
      setSubmission(data.submission);
      setRule(data.rule);
    } catch (err) {
      console.error("Error fetching submission details:", err);
    } finally {
      setLoading(false);
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
    <div className="w-full p-4 md:p-8">
      <SubmissionDetailView
        submission={submission}
        rule={rule}
        userRole="student"
        onUpdate={handleInlineUpdate}
        footer={
          submission.status === "pending" && !submission.comments && (
            <div className="p-4 border border-border border-dashed text-center">
              <p className="text-xs text-foreground/40 italic">
                No comments yet. Faculty will review your submission soon.
              </p>
            </div>
          )
        }
      />
    </div>
  );
}
