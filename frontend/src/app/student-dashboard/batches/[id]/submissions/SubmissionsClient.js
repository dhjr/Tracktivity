"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
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

          <Link
            href={`/student-dashboard/batches/${batchId}/add-certificate`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-bold uppercase tracking-widest hover:bg-foreground/90 transition-all shadow-xl hover:shadow-foreground/10 group w-fit"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            Add Submission
          </Link>
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
