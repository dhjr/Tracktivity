"use client";

import { CheckCircle2, Clock, XCircle, ChevronRight, FileText } from "lucide-react";

const TABS = ["all", "pending", "approved", "rejected"];

const statusConfig = {
  approved: {
    icon: CheckCircle2,
    label: "Approved",
    className: "bg-green-500/10 text-green-500",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    className: "bg-yellow-500/10 text-yellow-500",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    className: "bg-red-500/10 text-red-500",
  },
};

function StatusBadge({ status }) {
  const config = statusConfig[status];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

/**
 * A shared component for displaying a filtered list of submissions.
 *
 * @param {object[]} submissions - The list of submissions to display.
 * @param {string} activeTab - The currently active filter tab.
 * @param {function} onTabChange - Callback when a tab is clicked.
 * @param {function} [onRowClick] - Optional callback when a row is clicked (e.g., faculty review nav).
 * @param {boolean} [showStudent] - Whether to show the student name/ID column.
 * @param {boolean} [showAction] - Whether to show the action (Review →) column.
 */
export default function SubmissionList({
  submissions,
  activeTab,
  onTabChange,
  onRowClick,
  showStudent = false,
  showAction = false,
}) {
  return (
    <div>
      {/* Tab Bar */}
      <div className="flex items-center gap-2 mb-8 p-1 bg-secondary/10 w-fit rounded-none border border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-none ${
              activeTab === tab
                ? "bg-foreground text-background shadow-sm"
                : "text-foreground/40 hover:text-foreground hover:bg-secondary/20"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {submissions.length === 0 ? (
        <div className="p-12 border border-border border-dashed rounded-none bg-secondary/5 flex items-center justify-center flex-col gap-4">
          <span className="text-foreground/30 text-xs font-medium uppercase tracking-widest">
            {activeTab === "all"
              ? "No submissions found"
              : `No ${activeTab} submissions`}
          </span>
        </div>
      ) : (
        <div className="border border-border rounded-none overflow-hidden bg-background">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/20 border-b border-border">
              <tr>
                {showStudent && (
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50">
                    Student
                  </th>
                )}
                <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50">
                  Activity
                </th>
                <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50">
                  Points
                </th>
                <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50">
                  Status
                </th>
                <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50">
                  Submitted
                </th>
                {showAction && (
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-foreground/50 text-right">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {submissions.map((sub) => (
                <tr
                  key={sub.id}
                  onClick={() => onRowClick?.(sub)}
                  className={`hover:bg-secondary/5 transition-colors group ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {showStudent && (
                    <td className="px-4 py-3 font-medium text-foreground/80">
                      <div>{sub.student?.full_name ?? sub.studentName}</div>
                      <div className="text-foreground/50 text-[10px] font-mono">
                        {sub.student?.ktuid ?? sub.ktuid}
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div
                      className="max-w-[200px] truncate font-medium"
                      title={sub.activity_name ?? sub.name}
                    >
                      {sub.activity_name ?? sub.name}
                    </div>
                    <div className="text-[10px] text-foreground/40">
                      {sub.group_name ?? sub.category}
                      {sub.academic_year ? ` • year ${sub.academic_year}` : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-foreground/70">
                    {sub.points_awarded ?? sub.points}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground/50">
                    {new Date(sub.created_at ?? sub.submittedAt).toLocaleDateString()}
                  </td>
                  {showAction && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end items-center gap-2 text-foreground/50 group-hover:text-foreground transition-colors text-xs font-bold uppercase tracking-wider">
                        Review{" "}
                        <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
