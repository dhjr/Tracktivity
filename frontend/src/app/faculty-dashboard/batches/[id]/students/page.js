"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  Loader2,
  Users,
  X,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import MemberListSkeleton from "@/components/skeletons/MemberListSkeleton";

export default function FacultyBatchStudentsPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const { id: batchId } = use(params);

  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);

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

  const handleRespond = async (studentId, status) => {
    // Left empty for future implementation
  };

  if (!user || loading) return <MemberListSkeleton />;

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-5xl mx-auto p-4 md:p-8">

      <div className="mb-8 border-b border-border pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">
            {batch?.name} - Students
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm text-foreground/60 flex items-center gap-1">
              <Users className="w-4 h-4" /> {students.length} Students
            </p>
          </div>
        </div>
      </div>

      <div className="w-full pb-12">
        {students.length === 0 ? (
          <div className="p-12 border border-border border-dashed rounded-none bg-secondary/5 flex items-center justify-center">
            <span className="text-foreground/30 text-xs font-medium uppercase tracking-widest">
              No students in batch
            </span>
          </div>
        ) : (
          <div className="border border-border rounded-none overflow-hidden bg-background">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/20 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50">
                    Name
                  </th>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50">
                    Email
                  </th>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50">
                    KTU ID
                  </th>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student) => (
                  <tr
                    key={student.student_id}
                    className="hover:bg-secondary/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground/80">
                      {student.studentName}
                    </td>
                    <td className="px-4 py-3 text-foreground/50 text-xs">
                      {student.studentEmail}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        {student.ktuId}
                        {student.isKtuVerified ? (
                          <ShieldCheck className="w-3 h-3 text-green-500/50" />
                        ) : (
                          <ShieldAlert className="w-3 h-3 text-red-500/50" />
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
                        className="text-[10px] font-bold uppercase tracking-wider text-red-500/60 hover:text-red-600 transition-colors"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                " They will no longer be associated with this batch."}
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
    </div>
  );
}
