"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowLeft,
  Loader2,
  Users,
  FileText,
  ChevronRight,
} from "lucide-react";

export default function BatchSubmissionsPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const { id: batchId } = use(params);

  const [batch, setBatch] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (user?.user_metadata?.role !== "faculty") {
      router.push("/student-dashboard");
    } else {
      fetchBatchAndSubmissions();
    }
  }, [user, router, batchId]);

  const fetchBatchAndSubmissions = async () => {
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

      // 1. Fetch Batch Details
      const bRes = await fetch(`${API_URL}/batches/${batchId}/members`, {
        headers,
      });
      if (bRes.ok) {
        const bData = await bRes.json();
        setBatch(bData.batch);
      }

      // 2. Fetch All Submissions for Batch
      const res = await fetch(
        `${API_URL}/faculty/batches/${batchId}/submissions`,
        {
          headers,
        },
      );
      if (!res.ok) {
        if (res.status === 404) router.push("/faculty-dashboard");
        throw new Error("Failed to fetch submissions");
      }
      const data = await res.json();
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
              <FileText className="w-4 h-4" /> {submissions.length} Total
              Submissions
            </p>
          </div>
        </div>
      </div>

      <div className="w-full pb-12">
        {submissions.length === 0 ? (
          <div className="p-12 border border-border border-dashed rounded-none bg-secondary/5 flex items-center justify-center">
            <span className="text-foreground/30 text-xs font-medium uppercase tracking-widest">
              No submissions found for this batch
            </span>
          </div>
        ) : (
          <div className="border border-border rounded-none overflow-hidden bg-background">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/20 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50">
                    Student
                  </th>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50">
                    Activity
                  </th>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50">
                    Points
                  </th>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-secondary/5 transition-colors cursor-pointer group"
                    onClick={() =>
                      router.push(
                        `/faculty-dashboard/batches/${batchId}/submissions/${sub.student_id}/${sub.id}`,
                      )
                    }
                  >
                    <td className="px-4 py-3 font-medium text-foreground/80">
                      <div>{sub.student?.full_name}</div>
                      <div className="text-foreground/50 text-[10px] font-mono">
                        {sub.student?.ktuid}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="max-w-[200px] truncate font-medium"
                        title={sub.activity_name}
                      >
                        {sub.activity_name}
                      </div>
                      <div className="text-[10px] text-foreground/40">
                        {sub.group_name} • year {sub.academic_year}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground/70">
                      {sub.points_awarded}
                    </td>
                    <td className="px-4 py-3">
                      {sub.status === "pending" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/10 text-yellow-500">
                          Pending
                        </span>
                      )}
                      {sub.status === "approved" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-500">
                          Approved
                        </span>
                      )}
                      {sub.status === "rejected" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-500">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end items-center gap-2 text-foreground/50 group-hover:text-foreground transition-colors text-xs font-bold uppercase tracking-wider">
                        Review{" "}
                        <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
