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
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (user?.user_metadata?.role !== "faculty") {
      router.push("/student-dashboard");
    } else {
      fetchBatchAndStudents();
    }
  }, [user, router, batchId]);

  const fetchBatchAndStudents = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // Reusing the students endpoint to get the list of students in the batch
      const res = await fetch(`${API_URL}/batches/${batchId}/students`, {
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
                    Student
                  </th>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50">
                    KTU ID
                  </th>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50 text-right">
                    View Certs
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student) => (
                  <tr
                    key={student.student_id}
                    className="hover:bg-secondary/5 transition-colors cursor-pointer group"
                    onClick={() =>
                      router.push(
                        `/faculty-dashboard/batches/${batchId}/submissions/${student.student_id}`,
                      )
                    }
                  >
                    <td className="px-4 py-3 font-medium text-foreground/80">
                      <div>{student.studentName}</div>
                      <div className="text-foreground/50 text-xs font-normal">
                        {student.studentEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {student.ktuId}
                    </td>
                    <td className="px-4 py-3">
                      {/* Boilerplate status, to be updated later when we fetch actual certificates */}
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-yellow-500/10 text-yellow-500">
                        Pending Review
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end items-center gap-2 text-foreground/50 group-hover:text-foreground transition-colors">
                        <FileText className="w-4 h-4" />
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
