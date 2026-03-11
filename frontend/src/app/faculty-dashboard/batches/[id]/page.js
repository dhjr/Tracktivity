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
  Check,
  Trash2,
  Copy,
  FileText,
} from "lucide-react";

export default function FacultyBatchPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const { id: batchId } = use(params);

  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteBatch, setConfirmDeleteBatch] = useState(false);
  const [deleteBatchLoading, setDeleteBatchLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (user?.user_metadata?.role !== "faculty") {
      router.push("/student-dashboard");
    } else {
      fetchBatchDetails();
    }
  }, [user, router, batchId]);

  const fetchBatchDetails = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${API_URL}/batches/${batchId}/members`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (!res.ok) {
        if (res.status === 404) router.push("/faculty-dashboard");
        throw new Error("Failed to fetch batch details");
      }
      const data = await res.json();
      setBatch(data.batch);
      setStudents(data.students || []);
    } catch (err) {
      console.error("Error fetching batch details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async () => {
    setDeleteBatchLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${API_URL}/batches/${batchId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete batch");

      router.push("/faculty-dashboard");
      router.refresh();
    } catch (err) {
      console.error("Error deleting batch:", err);
      alert("Failed to delete batch. Please try again.");
      setDeleteBatchLoading(false);
      setConfirmDeleteBatch(false);
    }
  };

  const handleCopyCode = () => {
    if (batch?.batch_code) {
      navigator.clipboard.writeText(batch.batch_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          href="/faculty-dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <button
          onClick={() => setConfirmDeleteBatch(true)}
          className="inline-flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 px-3 py-1.5 rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Delete Batch
        </button>
      </div>

      <div className="mb-8 border-b border-border pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">
            {batch?.name}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={handleCopyCode}
              className="text-sm text-foreground/60 flex items-center gap-2 hover:text-foreground transition-colors group"
              title="Click to copy join code"
            >
              Batch Code:{" "}
              <span className="font-mono font-bold text-foreground group-hover:bg-foreground/10 px-1.5 py-0.5 rounded transition-colors">
                {batch?.batch_code}
              </span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
            <span className="text-foreground/30">•</span>
            <p className="text-sm text-foreground/60 flex items-center gap-1">
              <Users className="w-4 h-4" /> {students.length} Students
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-8 py-12">
        <Link
          href={`/faculty-dashboard/batches/${batchId}/students`}
          className="w-40 h-40 bg-secondary/5 border-2 border-dashed border-border hover:border-foreground/20 hover:bg-secondary/10 transition-all group flex items-center justify-center rounded-none"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40 group-hover:text-foreground/80">
            View Students
          </span>
        </Link>
        <Link
          href={`/faculty-dashboard/batches/${batchId}/submissions`}
          className="w-40 h-40 bg-secondary/5 border-2 border-dashed border-border hover:border-foreground/20 hover:bg-secondary/10 transition-all group flex items-center justify-center flex-col gap-4 rounded-none"
        >
          <FileText className="w-8 h-8 text-foreground/20 group-hover:text-foreground/60 transition-colors" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40 group-hover:text-foreground/80">
            View Submissions
          </span>
        </Link>
      </div>

      {/* Delete Batch Confirmation Modal */}
      {confirmDeleteBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-background border border-border shadow-lg rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-medium mb-2 text-red-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete Batch
            </h3>
            <p className="text-foreground/70 mb-6">
              Are you absolute sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {batch?.name}
              </span>
              ?
              <br />
              <br />
              This action is{" "}
              <span className="font-bold text-red-500">permanent</span> and
              cannot be undone. All student associations and batch data will be
              lost.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteBatch(false)}
                className="px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/50 transition-colors"
                disabled={deleteBatchLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBatch}
                disabled={deleteBatchLoading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {deleteBatchLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
