"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { getAuthHeaders } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Loader2,
  FileText,
  User,
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import PageLoader from "@/components/PageLoader";
import SubmissionDetailView from "@/components/SubmissionDetailView";

export default function SubmissionReviewPage({ params }) {
  const { user, isReady } = useRequireRole("faculty");
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
      const res = await fetch(`${API_URL}/faculty/submissions/${submissionId}`, { headers });
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

  const handleVerify = async (status) => {
    setVerifying(true);
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const res = await fetch(`${API_URL}/faculty/submissions/${submissionId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ status, comments: comment }),
      });
      if (res.ok) {
        router.push(`/faculty-dashboard/batches/${batchId}/submissions/${studentId}`);
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
        userRole="faculty"
        extraInfo={
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/30 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Student Information
            </h2>
            <div className="p-6 border border-border bg-secondary/5 space-y-4">
              <div>
                <p className="text-xs text-foreground/50 uppercase tracking-wider mb-1">
                  Full Name
                </p>
                <p className="font-medium">{submission.student?.full_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-foreground/50 uppercase tracking-wider mb-1">
                    KTU ID
                  </p>
                  <p className="font-mono text-sm">
                    {submission.student?.ktuid}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground/50 uppercase tracking-wider mb-1">
                    Department
                  </p>
                  <p className="text-sm">{submission.student?.department}</p>
                </div>
              </div>
            </div>
          </section>
        }
        footer={null}
      />
    </div>
  );
}

