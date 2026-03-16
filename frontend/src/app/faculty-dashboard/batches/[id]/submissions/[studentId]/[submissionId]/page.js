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
                  {rule?.max_points && (
                    <p className="text-[10px] text-foreground/40">
                      Rulebook Max: {rule.max_points}
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

          {submission.status === "pending" && (
            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/30 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Verification
              </h2>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add internal notes or reasons for rejection..."
                className="w-full h-32 p-4 bg-secondary/5 border border-border focus:border-foreground/30 focus:outline-none text-sm transition-colors resize-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleVerify("rejected")}
                  disabled={verifying}
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-red-500/20 text-red-500 hover:bg-red-500/5 transition-colors font-bold uppercase tracking-wider text-xs disabled:opacity-50"
                >
                  {verifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" /> Reject
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleVerify("approved")}
                  disabled={verifying}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors font-bold uppercase tracking-wider text-xs disabled:opacity-50"
                >
                  {verifying ? (
                    <Loader2 className="w-4 h-4 animate-spin text-background" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Approve & Award
                      Points
                    </>
                  )}
                </button>
              </div>
            </section>
          )}

          {submission.status !== "pending" && submission.comments && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/30 mb-4">
                Faculty Comments
              </h2>
              <div className="p-4 border border-border bg-secondary/5 italic text-sm text-foreground/70">
                "{submission.comments}"
              </div>
            </section>
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

// Simple Clock component since lucide Clock was used but not locally defined in the scope above if needed
function Clock({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
