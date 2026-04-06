"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import PageLoader from "@/components/PageLoader";
import CertificateForm from "@/components/CertificateForm";
import { getAuthHeaders } from "@/utils/api";

export default function FacultyEditSubmissionPage({ params }) {
  const { user, isReady } = useRequireRole("faculty");
  const router = useRouter();
  const resolvedParams = use(params);
  const { id: batchId, submissionId, studentId } = resolvedParams;

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState({ state: false, action: "" });

  useEffect(() => {
    if (isReady && submissionId) {
      fetchSubmissionDetail();
    }
  }, [isReady, submissionId]);

  const fetchSubmissionDetail = async () => {
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const res = await fetch(`${API_URL}/faculty/submissions/${submissionId}`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setSubmission(data.submission || data);
      } else {
        console.error("Failed to fetch submission details");
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (formData, status) => {
    setIsSubmitting(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const res = await fetch(`${API_URL}/faculty/submissions/${submissionId}/verify`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: status,
          comments: formData.comments,
        }),
      });

      if (res.ok) {
        setSuccess({ state: true, action: status });
        setTimeout(() => {
          router.push(`/faculty-dashboard/batches/${batchId}/submissions/${studentId}/${submissionId}`);
        }, 2000);
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || "Failed to update review"}`);
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("An error occurred during verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady || loading) return <PageLoader />;
  if (!submission) return <div className="p-12 text-center text-foreground/50">Submission not found.</div>;

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10 flex flex-col items-center">
        {/* Header Section - Simplified & Centered */}
        <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-5xl font-display font-bold tracking-tight text-foreground leading-[1.1]">
            Review Submission
          </h1>
          <p className="text-sm text-foreground/40 mt-4 max-w-md mx-auto">
            Review certificate details and provide feedback or verify the points.
          </p>
        </div>

        <div className="w-full max-w-2xl">
          {success.state ? (
            <div className={`p-12 border flex flex-col items-center justify-center text-center space-y-4 ${
              success.action === 'approved' ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'
            }`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                success.action === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
              }`}>
                {success.action === 'approved' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              </div>
              <h2 className="text-xl font-medium text-foreground">
                Submission {success.action === 'approved' ? 'Approved' : 'Rejected'}!
              </h2>
              <p className="text-sm text-foreground/60">
                The status has been updated and the student will be notified. Redirecting...
              </p>
            </div>
          ) : (
            <CertificateForm
              initialData={submission}
              isFaculty={true}
              onSubmit={(data) => handleVerify(data, "approved")}
              isSubmitting={isSubmitting}
              footer={
                <div className="flex w-full items-center justify-center gap-4">
                  <button
                    onClick={() => router.back()}
                    type="button"
                    className="px-8 py-2 text-sm font-medium hover:bg-secondary/50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        const commentsArea = document.getElementById('comments');
                        handleVerify({ comments: commentsArea?.value || '' }, "rejected");
                      }}
                      type="button"
                      className="px-8 py-2 text-sm font-medium border border-red-500/50 text-red-500 hover:bg-red-500/5 transition-colors disabled:opacity-50 min-w-[180px]"
                      disabled={isSubmitting}
                    >
                      Reject Submission
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-green-600 text-white px-10 py-2 text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center min-w-[200px] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Approve & Verify"
                      )}
                    </button>
                  </div>
                </div>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
