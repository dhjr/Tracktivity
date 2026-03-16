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
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8 border-b border-border pb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-secondary/50 flex items-center justify-center text-lg font-bold text-foreground/60 shrink-0">
          {getInitials(studentInfo?.name)}
        </div>
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground">{studentInfo?.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-foreground/50">
            {studentInfo?.ktuid && <span className="font-mono">{studentInfo.ktuid}</span>}
            {studentInfo?.department && (
              <><span className="text-foreground/20">•</span><span>{studentInfo.department}</span></>
            )}
            <span className="text-foreground/20">•</span>
            <span><span className="text-green-500 font-semibold">{studentInfo?.totalPoints}</span> pts approved</span>
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
  );
}
