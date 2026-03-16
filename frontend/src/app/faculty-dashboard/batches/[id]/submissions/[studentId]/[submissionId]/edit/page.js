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
    <div className="min-h-[calc(100vh-4rem)] w-full max-w-3xl mx-auto p-4 md:p-6 pt-8 md:pt-12">
      <div className="mb-6">
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          Review Submission
        </h1>
        <p className="text-xs text-foreground/60 mt-1">
          Review certificate details and provide feedback or verify the points.
        </p>
      </div>

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
        <div id="dummy-form-container">
          <CertificateForm
            initialData={submission}
            isFaculty={true}
            onSubmit={(data) => handleVerify(data, "approved")}
            isSubmitting={isSubmitting}
            footer={
              <div className="flex w-full items-center justify-between">
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
                      // Grab comments from the form state involves a bit of a trick 
                      // if I don't want to add more props. 
                      // Actually, I'll just update CertificateForm to pass both data and status or something.
                      // For now, I'll just trigger a hidden submit or similar if I had access.
                      // Simplified: I'll just use a 'Verify' button and a 'Reject' button that both call verify.
                      const commentsArea = document.getElementById('comments');
                      handleVerify({ comments: commentsArea?.value || '' }, "rejected");
                    }}
                    type="button"
                    className="px-8 py-2 text-sm font-medium border border-red-500/50 text-red-500 hover:bg-red-500/5 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    Reject Submission
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 text-white px-10 py-2 text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center min-w-[180px] disabled:opacity-50"
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
        </div>
      )}
    </div>
  );
}
