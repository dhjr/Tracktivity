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

  if (!user || loading) return <PageLoader />;

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
