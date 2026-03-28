"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SubmissionList from "@/components/SubmissionList";

export default function SubmissionsClient({ initialSubmissions, batchId, batchName }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const filteredSubmissions =
    activeTab === "all"
      ? initialSubmissions
      : initialSubmissions.filter((s) => s.status === activeTab);

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10">
      <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-2">
           <span className="text-xs font-bold uppercase tracking-[0.3em] text-foreground/30">
            {batchName}
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground leading-tight flex items-baseline gap-4">
            Submissions
            <span className="text-xl md:text-2xl font-normal text-foreground/30">
              Total: {initialSubmissions.length}
            </span>
          </h1>
        </div>
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
  );
}
