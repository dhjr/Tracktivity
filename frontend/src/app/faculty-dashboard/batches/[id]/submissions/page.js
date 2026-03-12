"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Loader2, FileText } from "lucide-react";
import SubmissionList from "@/components/SubmissionList";

export default function BatchSubmissionsPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const { id: batchId } = use(params);

  const [batch, setBatch] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (user?.user_metadata?.role !== "faculty") {
      router.push("/student-dashboard");
    } else {
      fetchBatchAndSubmissions(activeTab);
    }
  }, [user, router, batchId, activeTab]);

  const fetchBatchAndSubmissions = async (statusFilter) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const headers = {
        Authorization: `Bearer ${session?.access_token}`,
      };

      // Fetch batch details + submissions in parallel
      let submissionsUrl = `${API_URL}/faculty/batches/${batchId}/submissions`;
      if (statusFilter !== "all") {
        submissionsUrl += `?status=${statusFilter}`;
      }

      const [bRes, subRes] = await Promise.all([
        fetch(`${API_URL}/batches/${batchId}`, { headers }),
        fetch(submissionsUrl, { headers }),
      ]);

      if (bRes.ok) {
        const bData = await bRes.json();
        setBatch(bData);
      }

      if (!subRes.ok) {
        if (subRes.status === 404) router.push("/faculty-dashboard");
        throw new Error("Failed to fetch submissions");
      }
      const data = await subRes.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error("Error fetching batch submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/faculty-dashboard/batches/${batchId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Batch
        </Link>
      </div>

      <div className="mb-8 border-b border-border pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">
            {batch?.name} - Submissions
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm text-foreground/60 flex items-center gap-1">
              <FileText className="w-4 h-4" /> {submissions.length} Submissions
            </p>
          </div>
        </div>
      </div>

      <div className="w-full pb-12">
        <SubmissionList
          submissions={submissions}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showStudent={true}
          showAction={true}
          onRowClick={(sub) =>
            router.push(
              `/faculty-dashboard/batches/${batchId}/submissions/${sub.student_id}/${sub.id}`,
            )
          }
        />
      </div>
    </div>
  );
}
