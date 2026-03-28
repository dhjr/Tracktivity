"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { getAuthHeaders } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import {} from "lucide-react";
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
    activeTab === "all"
      ? allSubmissions
      : allSubmissions.filter((s) => s.status === activeTab);

  if (!user || loading) return <PageLoader />;

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10">
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground leading-tight flex items-baseline gap-4">
            Submissions
            <span className="text-xl md:text-2xl font-normal text-foreground/30">
              Total: {allSubmissions.length}
            </span>
          </h1>
        </div>
        <div className="w-full pb-12">
          <SubmissionList
            submissions={filteredSubmissions}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onRowClick={(sub) =>
              router.push(
                `/student-dashboard/batches/${batchId}/submissions/${sub.id}`,
              )
            }
            showStudent={false}
            showAction={true}
          />
        </div>
      </div>
    </div>
  );
}
