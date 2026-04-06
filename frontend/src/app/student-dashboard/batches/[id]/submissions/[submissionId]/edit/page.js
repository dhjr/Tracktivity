"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import PageLoader from "@/components/PageLoader";
import CertificateFormSkeleton from "@/components/skeletons/CertificateFormSkeleton";
import CertificateForm from "@/components/CertificateForm";
import { getAuthHeaders } from "@/utils/api";

export default function StudentEditSubmissionPage({ params }) {
  const { user, isReady } = useRequireRole("student");
  const router = useRouter();
  const resolvedParams = use(params);
  const { id: batchId, submissionId } = resolvedParams;

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isReady && submissionId) {
      fetchSubmissionDetail();
    }
  }, [isReady, submissionId]);

  const fetchSubmissionDetail = async () => {
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const res = await fetch(`${API_URL}/student/submissions/${submissionId}`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        const submissionData = data.submission || data;
        
        // Prevent editing if already approved
        if (submissionData.status === "approved") {
          router.replace(`/student-dashboard/batches/${batchId}/submissions/${submissionId}`);
          return;
        }

        setSubmission(submissionData);
      } else {
        console.error("Failed to fetch submission details");
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const submitData = new FormData();

      // For editing, we might need a different endpoint, but the user said 
      // "Dont worry about the backend endpoints for now."
      // I'll simulate a success response or use a dummy endpoint if I have to.
      // For now, I'll log the data and show success.
      
      console.log("Submitting Edits:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setTimeout(() => {
        router.push(`/student-dashboard/batches/${batchId}/submissions/${submissionId}`);
      }, 2000);
      
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady || loading) return <CertificateFormSkeleton />;
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
            Edit Submission
          </h1>
          <p className="text-sm text-foreground/40 mt-4 max-w-md mx-auto">
            Modify your certificate details or replace the uploaded file to update your request.
          </p>
        </div>

        <div className="w-full max-w-2xl">
          {success ? (
            <div className="p-12 border border-green-500/20 bg-green-500/5 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-medium text-foreground">
                Changes Saved!
              </h2>
              <p className="text-sm text-foreground/60">
                Your submission has been updated and is pending review. Redirecting...
              </p>
            </div>
          ) : (
            <CertificateForm
              initialData={submission}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              footer={
                <div className="flex w-full items-center justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-foreground text-background px-10 py-2 text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center min-w-[200px] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
