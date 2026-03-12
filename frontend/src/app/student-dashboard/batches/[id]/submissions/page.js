"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import SubmissionList from "@/components/SubmissionList";

export default function StudentSubmissionsPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const { id: batchId } = use(params);

  const [batchName, setBatchName] = useState("");
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (
      user?.user_metadata?.role !== "student" &&
      user?.user_metadata?.role !== undefined
    ) {
      router.push("/faculty-dashboard");
    } else {
      fetchSubmissions();
    }
  }, [user, router, batchId]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const headers = { Authorization: `Bearer ${session?.access_token}` };

      const [batchRes, submissionsRes] = await Promise.all([
        fetch(`${API_URL}/batches/${batchId}`, { headers }),
        fetch(`${API_URL}/student/dashboard?view=all`, { headers }),
      ]);

      if (batchRes.ok) {
        const b = await batchRes.json();
        setBatchName(b.name);
      }

      if (submissionsRes.ok) {
        const subData = await submissionsRes.json();
        setAllSubmissions(subData.submissions || []);
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions =
    activeTab === "all"
      ? allSubmissions
      : allSubmissions.filter((s) => s.status === activeTab);

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
          href={`/student-dashboard/batches/${batchId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Batch
        </Link>
      </div>

      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          {batchName} – My Submissions
        </h1>
        <p className="text-sm text-foreground/60 mt-1">{allSubmissions.length} total submission{allSubmissions.length !== 1 && "s"}</p>
      </div>

      <div className="w-full pb-12">
        <SubmissionList
          submissions={filteredSubmissions}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showStudent={false}
          showAction={false}
        />
      </div>
    </div>
  );
}
