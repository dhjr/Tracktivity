"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getInitials } from "@/utils/helpers";

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

export default function SubmissionsClient({ batch, initialStudents, batchId }) {
  const router = useRouter();

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10">
      <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-2">
           <span className="text-xs font-bold uppercase tracking-[0.3em] text-foreground/30">
            Faculty Dashboard
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground leading-tight flex items-baseline gap-4">
            {batch?.name || "Batch Submissions"}
            <span className="text-xl md:text-2xl font-normal text-foreground/30">
              Total Students: {initialStudents.length}
            </span>
          </h1>
        </div>
      </div>

      <div className="w-full pb-12">
        {initialStudents.length === 0 ? (
          <div className="p-12 border border-border border-dashed bg-secondary/5 flex items-center justify-center">
            <span className="text-foreground/30 text-xs font-medium uppercase tracking-widest">
              No submissions yet for this batch
            </span>
          </div>
        ) : (
          <div className="border border-border overflow-hidden bg-background divide-y divide-border">
            {initialStudents.map((student) => (
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
