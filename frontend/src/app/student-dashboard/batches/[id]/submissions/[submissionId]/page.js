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

      <div className="min-h-[calc(100vh-6rem)] w-full flex flex-col items-center justify-center gap-4">
        <p className="text-foreground/50">Submission not found</p>
      </div>

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-end mb-8">
        <div className="flex items-center gap-3">
          {submission.status === "pending" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">
              <Clock className="w-3.5 h-3.5" /> Pending Review
            </span>
          )}
          {submission.status === "approved" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
            </span>
          )}
          {submission.status === "rejected" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
              <XCircle className="w-3.5 h-3.5" /> Rejected
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Details */}
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/30 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Activity Details
            </h2>
            <div className="p-6 border border-border bg-background space-y-6">
              <div>
                <p className="text-xs text-foreground/50 uppercase tracking-wider mb-1">
                  Activity Name
                </p>
                <p className="font-medium text-lg leading-tight">
                  {submission.activity_name}
                </p>
                <p className="text-xs text-foreground/40 mt-1">
                  Code: {submission.activity_id} • Group:{" "}
                  {submission.group_name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-foreground/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Points
                  </p>
                  <p className="text-2xl font-bold text-green-500">
                    {submission.points_awarded}
                  </p>
                  {rule?.maxPoints && (
                    <p className="text-[10px] text-foreground/40">
                      Rulebook Max: {rule.maxPoints}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-foreground/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Year/Level
                  </p>
                  <p className="text-lg font-medium">
                    Year {submission.academic_year}
                  </p>
                  {submission.level && (
                    <p className="text-xs text-foreground/50 capitalize font-medium">
                      Level: {submission.level}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-foreground/50 uppercase tracking-wider mb-1">
                  Certificate Date
                </p>
                <p className="text-sm font-medium italic">
                  {new Date(submission.certificate_date).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
            </div>
          </section>

          {submission.comments && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/30 mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Faculty Comments
              </h2>
              <div className="p-4 border border-border bg-secondary/5 italic text-sm text-foreground/70">
                "{submission.comments}"
              </div>
            </section>
          )}

          {submission.status === "pending" && !submission.comments && (
            <div className="p-4 border border-border border-dashed text-center">
              <p className="text-xs text-foreground/40 italic">
                No comments yet. Faculty will review your submission soon.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Certificate Preview */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/30 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Certificate Evidence
            </span>
            <a
              href={submission.certificate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] underline hover:text-foreground transition-colors flex items-center gap-1"
            >
              Open Original <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </h2>
          <div className="aspect-3/4 w-full border border-border bg-black/5 flex items-center justify-center overflow-hidden">
            {submission.certificate_url?.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={submission.certificate_url}
                className="w-full h-full border-none"
              />
            ) : (
              <img
                src={submission.certificate_url}
                alt="Certificate"
                className="max-w-full max-h-full object-contain shadow-2xl"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
