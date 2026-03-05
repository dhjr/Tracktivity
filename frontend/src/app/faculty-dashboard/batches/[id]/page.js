"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Users,
  Check,
  X,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Copy,
} from "lucide-react";

export default function FacultyBatchPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const { id: batchId } = use(params);

  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null); // stores the student to be rejected/revoked
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
      const res = await fetch(`/api/batches/${batchId}/students`);
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

  const handleRespond = async (studentId, status) => {
    // Left empty for future implementation
  };

  const handleDeleteBatch = async () => {
    setDeleteBatchLoading(true);
    try {
      const res = await fetch(`/api/batches/${batchId}`, {
        method: "DELETE",
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

  const pendingRequests = enrollments.filter((e) => e.status === "pending");
  const approvedStudents = enrollments.filter((e) => e.status === "approved");

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

      <div className="space-y-12">
        {/* Enrolled Students Section */}
        <section>
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
            Enrolled Students
          </h2>

          {students.length === 0 ? (
            <div className="p-6 border border-border border-dashed rounded-xl bg-secondary/10 flex flex-col items-center justify-center text-center">
              <span className="text-foreground/40">
                No students are currently enrolled in this batch.
              </span>
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary/30 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium text-foreground/70">
                      Name
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground/70">
                      Email
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground/70">
                      KTU ID
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground/70 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-background">
                  {students.map((student) => (
                    <tr
                      key={student.student_id}
                      className="hover:bg-secondary/10 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">
                        {student.studentName}
                      </td>
                      <td className="px-4 py-3 text-foreground/70">
                        {student.studentEmail}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <div className="flex items-center gap-2">
                          {student.ktuId}
                          {student.isKtuVerified ? (
                            <ShieldCheck
                              className="w-4 h-4 text-green-500"
                              title="Verified KTU ID"
                            />
                          ) : (
                            <ShieldAlert
                              className="w-4 h-4 text-red-500"
                              title="Unverified KTU ID"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() =>
                            setConfirmReject({
                              id: student.student_id,
                              name: student.studentName,
                              type: "revoke",
                            })
                          }
                          disabled={actionLoading === student.student_id}
                          className="text-red-500 hover:text-red-600 font-medium text-xs disabled:opacity-50 flex items-center gap-1"
                        >
                          Revoke Access
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Confirmation Modal */}
      {confirmReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-background border border-border shadow-lg rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-medium mb-2">
              {confirmReject.type === "reject"
                ? "Reject Join Request"
                : "Revoke Access"}
            </h3>
            <p className="text-foreground/70 mb-6">
              Are you sure you want to{" "}
              {confirmReject.type === "reject" ? "reject" : "revoke access for"}{" "}
              <span className="font-semibold text-foreground">
                {confirmReject.name}
              </span>
              ?
              {confirmReject.type === "revoke" &&
                " They will no longer have access to this room."}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmReject(null)}
                className="px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/50 transition-colors"
                disabled={actionLoading === confirmReject.id}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleRespond(confirmReject.id, "rejected");
                  setConfirmReject(null);
                }}
                disabled={actionLoading === confirmReject.id}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading === confirmReject.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    {confirmReject.type === "reject"
                      ? "Reject Request"
                      : "Revoke Access"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
              cannot be undone. All enrollments and batch data will be lost.
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
