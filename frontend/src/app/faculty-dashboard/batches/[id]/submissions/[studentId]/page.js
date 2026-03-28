"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { getAuthHeaders } from "@/utils/api";
import { getInitials } from "@/utils/helpers";
import PageLoader from "@/components/PageLoader";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import {  } from "lucide-react";
import SubmissionList from "@/components/SubmissionList";

export default function FacultyStudentSubmissionsPage({ params }) {
  const { user, isReady } = useRequireRole("faculty");
  const router = useRouter();
  const { id: batchId, studentId } = use(params);

  const [studentInfo, setStudentInfo] = useState(null);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (isReady) fetchStudentData();
  }, [isReady, batchId, studentId]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const [metaRes, subRes] = await Promise.all([
        fetch(`${API_URL}/faculty/batches/${batchId}/students/${studentId}`, { headers }),
        fetch(`${API_URL}/faculty/batches/${batchId}/students/${studentId}/submissions`, { headers }),
      ]);
      if (metaRes.ok) {
        const { student: s } = await metaRes.json();
        setStudentInfo({
          name: s.full_name,
          ktuid: s.ktuid,
          department: s.department,
          totalPoints: (s.grp1_points || 0) + (s.grp2_points || 0) + (s.grp3_points || 0),
        });
      }
      if (subRes.ok) {
        const { submissions } = await subRes.json();
        setAllSubmissions(submissions || []);
      }
    } catch (err) {
      console.error("Error fetching student submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions =
    activeTab === "all" ? allSubmissions : allSubmissions.filter((s) => s.status === activeTab);

  if (!user || loading) return <PageLoader />;

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10">
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-5 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-secondary/30 border border-border/50 backdrop-blur-md flex items-center justify-center text-xl font-bold text-foreground/40 shrink-0 relative overflow-hidden group">
               <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <span className="relative z-10">{getInitials(studentInfo?.name)}</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground leading-tight flex items-baseline gap-4">
                {studentInfo?.name}
                <span className="text-xl md:text-2xl font-normal text-foreground/30">
                  Total: {allSubmissions.length}
                </span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm md:text-base text-foreground/40 font-medium font-display uppercase tracking-widest">
                {studentInfo?.ktuid && <span>{studentInfo.ktuid}</span>}
                <div className="h-1 w-1 rounded-full bg-border" />
                <span>{studentInfo?.department || "Student"}</span>
                <div className="h-1 w-1 rounded-full bg-border" />
                <span className="text-primary/60">{studentInfo?.totalPoints} Points</span>
              </div>
            </div>
          </div>
        </div>
      <div className="w-full pb-12">
        <SubmissionList
          submissions={filteredSubmissions}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showStudent={false}
          showAction={true}
          onRowClick={(sub) =>
            router.push(`/faculty-dashboard/batches/${batchId}/submissions/${studentId}/${sub.id}`)
          }
        />
      </div>
    </div>
  </div>
);
}
