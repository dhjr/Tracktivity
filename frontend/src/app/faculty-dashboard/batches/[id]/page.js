"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { getAuthHeaders } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Trash2, FileText } from "lucide-react";
import BatchNavCard from "@/components/BatchNavCard";
import PageLoader from "@/components/PageLoader";
import BatchCodeBadge from "@/components/BatchCodeBadge";

export default function FacultyBatchPage({ params }) {
  const { user, isReady } = useRequireRole("faculty");
  const router = useRouter();
  const { id: batchId } = use(params);

  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteBatch, setConfirmDeleteBatch] = useState(false);
  const [deleteBatchLoading, setDeleteBatchLoading] = useState(false);

  useEffect(() => {
    if (isReady) fetchBatchDetails();
  }, [isReady, batchId]);

  const fetchBatchDetails = async () => {
    setLoading(true);
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const res = await fetch(`${API_URL}/batches/${batchId}/members`, { headers });
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
      const { headers, API_URL } = await getAuthHeaders();
      const res = await fetch(`${API_URL}/batches/${batchId}`, {
        method: "DELETE",
        headers,
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


  if (!user || loading) return <PageLoader />;

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
            <BatchCodeBadge code={batch?.batch_code} />
            <span className="text-foreground/30">•</span>
            <p className="text-sm text-foreground/60 flex items-center gap-1">
              <Users className="w-4 h-4" /> {students.length} Students
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-8 py-12">
        <BatchNavCard
          href={`/faculty-dashboard/batches/${batchId}/members`}
          icon={<Users className="w-8 h-8" />}
          label="View Members"
        />
        <BatchNavCard
          href={`/faculty-dashboard/batches/${batchId}/submissions`}
          icon={<FileText className="w-8 h-8" />}
          label="View Submissions"
        />
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
