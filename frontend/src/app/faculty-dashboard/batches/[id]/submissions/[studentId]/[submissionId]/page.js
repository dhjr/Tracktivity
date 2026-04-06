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

  const handleVerify = async (status) => {
    setVerifying(true);
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const res = await fetch(
        `${API_URL}/faculty/submissions/${submissionId}/verify`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ status, comments: comment }),
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
        footer={null}
      />
    </div>
  );
}
