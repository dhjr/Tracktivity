"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { Loader2, CheckCircle2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import PageLoader from "@/components/PageLoader";
import CertificateForm from "@/components/CertificateForm";
import { useStats } from "@/components/providers/StatsProvider";
import { getAuthHeaders } from "@/utils/api";

export default function StudentAddCertificatePage({ params }) {
  const { user, isReady } = useRequireRole("student");
  const { refreshStats } = useStats();
  const router = useRouter();
  const { id: batchId } = use(params);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady) {
      fetchBatchDetails();
    }
  }, [isReady, batchId]);

  const fetchBatchDetails = async () => {
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const res = await fetch(`${API_URL}/batches/${batchId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setBatch(data);
      }
    } catch (err) {
      console.error("Error fetching batch:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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

  if (!isReady || !user || loading) return <PageLoader />;

  return (
    <div className="h-[calc(100vh-4rem)] w-full relative overflow-hidden bg-background flex flex-col">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto p-4 md:px-10 md:py-8 flex flex-col h-full overflow-hidden">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 shrink-0">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-foreground/30">
              Batch: {batch?.name || "..."}
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground leading-tight">
              Create Submission
            </h1>
          </div>
        </div>

        {success ? (
          <div className="p-12 border border-border bg-background shadow-2xl flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto my-auto animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-2">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground uppercase">
                Submission Successful
              </h2>
              <p className="text-sm text-foreground/60 max-w-sm">
                Your certificate has been uploaded and is now pending faculty
                review. You'll be redirected to your dashboard shortly.
              </p>
            </div>
            <div className="w-full max-w-[200px] h-1 bg-secondary/20 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 animate-[loading-bar_2s_ease-in-out]" />
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 h-full overflow-hidden flex flex-col">
            <CertificateForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              footer={
                <div className="flex items-center gap-4 mt-6">
                  <button
                    onClick={() => router.back()}
                    type="button"
                    className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-secondary/20 transition-all border border-transparent hover:border-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-foreground text-background px-10 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 transition-all shadow-xl hover:shadow-foreground/10 flex items-center justify-center min-w-[220px] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Submit Certificate"
                    )}
                  </button>
                </div>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
