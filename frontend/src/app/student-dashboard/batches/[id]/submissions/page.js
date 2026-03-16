"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { getAuthHeaders } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import {  } from "lucide-react";
import PageLoader from "@/components/PageLoader";
import SubmissionList from "@/components/SubmissionList";

export default function StudentSubmissionsPage({ params }) {
  const { user, isReady } = useRequireRole("student");
  const router = useRouter();
  const { id: batchId } = use(params);

  const [batchName, setBatchName] = useState("");
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (isReady) fetchSubmissions();
  }, [isReady, batchId]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const [batchRes, submissionsRes] = await Promise.all([
        fetch(`${API_URL}/batches/${batchId}`, { headers }),
        fetch(`${API_URL}/student/dashboard?view=all`, { headers }),
      ]);
      if (batchRes.ok) setBatchName((await batchRes.json()).name);
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
    activeTab === "all" ? allSubmissions : allSubmissions.filter((s) => s.status === activeTab);

  if (!user || loading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          {batchName} – My Submissions
        </h1>
        <p className="text-sm text-foreground/60 mt-1">
          {allSubmissions.length} total submission{allSubmissions.length !== 1 && "s"}
        </p>
      </div>
      <div className="w-full pb-12">
        <SubmissionList
          submissions={filteredSubmissions}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRowClick={(sub) => router.push(`/student-dashboard/batches/${batchId}/submissions/${sub.id}`)}
          showStudent={false}
          showAction={true}
        />
      </div>
    </div>
  );
}
