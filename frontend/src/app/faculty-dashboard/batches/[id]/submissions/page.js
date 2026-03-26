"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { getAuthHeaders } from "@/utils/api";
import { getInitials } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import PageLoader from "@/components/PageLoader";

function StatusDot({ count, status }) {
  const colors = {
    pending: "bg-yellow-400",
    approved: "bg-green-400",
    rejected: "bg-red-400",
  };
  if (!count) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground/40">
      <span className={`w-1.5 h-1.5 rounded-full ${colors[status]}`} />
      {count}
    </span>
  );
}

export default function BatchSubmissionsPage({ params }) {
  const { user, isReady } = useRequireRole("faculty");
  const router = useRouter();
  const { id: batchId } = use(params);

  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady) fetchData();
  }, [isReady, batchId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { headers, API_URL } = await getAuthHeaders();

      const [batchRes, subsRes] = await Promise.all([
        fetch(`${API_URL}/batches/${batchId}`, { headers }),
        fetch(`${API_URL}/faculty/batches/${batchId}/submissions`, { headers }),
      ]);

      if (batchRes.ok) setBatch(await batchRes.json());

      if (subsRes.ok) {
        const data = await subsRes.json();
        const map = {};
        for (const sub of data.submissions || []) {
          const sid = sub.student_id;
          if (!map[sid]) {
            map[sid] = {
              id: sid,
              name: sub.student?.full_name || "Unknown",
              ktuid: sub.student?.ktuid || "",
              department: sub.student?.department || "",
              total: 0,
              pending: 0,
              approved: 0,
              rejected: 0,
            };
          }
          map[sid].total++;
          map[sid][sub.status] = (map[sid][sub.status] || 0) + 1;
        }
        setStudents(
          Object.values(map).sort((a, b) => {
            if (a.pending !== b.pending) return b.pending - a.pending;
            return a.name.localeCompare(b.name);
          })
        );
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-5xl mx-auto p-4 md:p-8">

      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          {batch?.name} – Submissions
        </h1>
        <p className="text-sm text-foreground/60 flex items-center gap-1 mt-2">
          <FileText className="w-4 h-4" /> {students.length} student{students.length !== 1 && "s"} with submissions
        </p>
      </div>

      <div className="w-full pb-12">
        {students.length === 0 ? (
          <div className="p-12 border border-border border-dashed bg-secondary/5 flex items-center justify-center">
            <span className="text-foreground/30 text-xs font-medium uppercase tracking-widest">
              No submissions yet for this batch
            </span>
          </div>
        ) : (
          <div className="border border-border overflow-hidden bg-background divide-y divide-border">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() =>
                  router.push(`/faculty-dashboard/batches/${batchId}/submissions/${student.id}`)
                }
                className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/5 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center shrink-0 text-sm font-bold text-foreground/60 group-hover:text-foreground transition-colors">
                  {getInitials(student.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground/90 truncate">{student.name}</span>
                    <div className="flex items-center gap-2">
                      <StatusDot count={student.pending} status="pending" />
                      <StatusDot count={student.approved} status="approved" />
                      <StatusDot count={student.rejected} status="rejected" />
                    </div>
                  </div>
                  <p className="text-xs text-foreground/40 font-mono">
                    {student.ktuid || student.department || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-medium text-foreground/40">
                    {student.total} submission{student.total !== 1 && "s"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/60 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
