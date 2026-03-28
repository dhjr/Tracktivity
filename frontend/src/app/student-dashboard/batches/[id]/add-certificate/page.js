"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { useRouter } from "next/navigation";
import { useState, use } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import PageLoader from "@/components/PageLoader";
import CertificateForm from "@/components/CertificateForm";
import { useStats } from "@/components/providers/StatsProvider";

export default function StudentAddCertificatePage({ params }) {
  const { user, isReady } = useRequireRole("student");
  const { refreshStats } = useStats();
  const router = useRouter();
  const { id: batchId } = use(params);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const submitData = new FormData();

      submitData.append("activity_code", formData.activity_id);
      submitData.append("group_name", formData.groupId);
      submitData.append("points_awarded", formData.points_awarded);
      if (formData.level_key) {
        submitData.append("level_key", formData.level_key);
      }
      submitData.append("student_id", user.id);
      submitData.append("academic_year", formData.academic_year);
      submitData.append("file", formData.file);
      // Date isn't explicitly sent in existing backend student/submit but maybe it should be? 
      // Keeping existing logic.

      const res = await fetch(`${API_URL}/student/submit`, {
        method: "POST",
        body: submitData,
      });

      if (res.ok) {
        setSuccess(true);
        await refreshStats();
        setTimeout(() => {
          router.push(`/student-dashboard/batches/${batchId}`);
        }, 2000);
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || "Failed to submit certificate"}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady || !user) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full max-w-3xl mx-auto p-4 md:p-6 pt-8 md:pt-12">
      <div className="mb-6">
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          Submit Certificate
        </h1>
        <p className="text-xs text-foreground/60 mt-1">
          Upload your certificate details and file for faculty review.
        </p>
      </div>

      {success ? (
        <div className="p-12 border border-green-500/20 bg-green-500/5 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-medium text-foreground">
            Certificate Submitted!
          </h2>
          <p className="text-sm text-foreground/60">
            Your certificate is now pending review by your faculty. You will be
            redirected shortly...
          </p>
        </div>
      ) : (
        <CertificateForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          footer={
            <>
              <button
                onClick={() => router.back()}
                type="button"
                className="px-8 py-2 text-sm font-medium hover:bg-secondary/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-foreground text-background px-10 py-2 text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center min-w-[200px] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Submit Certificate"
                )}
              </button>
            </>
          }
        />
      )}
    </div>
  );
}
