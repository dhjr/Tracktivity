"use client";

import { useState } from "react";
import {
  FileText,
  Activity,
  Award,
  Calendar,
  MessageSquare,
  ExternalLink,
  Maximize2,
  X,
} from "lucide-react";
import { formatDate } from "@/utils/helpers";
import StatusBadge from "./StatusBadge";

export default function SubmissionDetailView({
  submission,
  rule,
  extraInfo, // Slot for top of left column (e.g. Student Info)
  footer, // Slot for bottom of left column (e.g. Verification actions)
  userRole = "student", // Add role to control edit permission
}) {
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  if (!submission) return null;

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 pb-8">
        {/* Left Column: Details */}
        <div className="space-y-6">
          {extraInfo}

          <section>
            <div className="p-6 border border-border bg-background space-y-8">
              <div>
                <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold mb-1.5">
                  Activity name
                </p>
                <h1 className="font-bold text-3xl leading-tight text-foreground tracking-tight">
                  {submission.activity_name}
                </h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                <div>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1.5 font-bold">
                    Activity Code
                  </p>
                  <p className="text-sm font-medium">
                    {submission.activity_id}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1.5 font-bold">
                    Group
                  </p>
                  <p className="text-sm font-medium">{submission.group_name}</p>
                </div>

                <div>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1.5 font-bold flex items-center gap-1">
                    Academic Year
                  </p>
                  <p className="text-sm font-medium">
                    Year {submission.academic_year}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1.5 font-bold flex items-center gap-1">
                    Points Earned
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-green-500">
                      {submission.points_awarded}
                    </p>
                    {(rule?.maxPoints || rule?.max_points) && (
                      <p className="text-[10px] text-foreground/30">
                        / {rule.maxPoints || rule.max_points} MAX
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1 font-bold">
                    Submitted on
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(submission.certificate_date, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {submission.comments && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/30 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Faculty Comments
              </h2>
              <div className="p-4 border border-border bg-secondary/5 italic text-sm text-foreground/70">
                "{submission.comments}"
              </div>
            </section>
          )}

          {footer}
        </div>

        {/* Right Column: Certificate Preview */}
        <div className="flex flex-col h-full">
          <div className="space-y-4 grow flex flex-col">
            <div className="flex items-center justify-between">
              <StatusBadge status={submission.status} />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullViewOpen(true)}
                  title="View Full Screen"
                  className="p-1.5 text-foreground/40 hover:text-foreground hover:bg-secondary/20 transition-colors rounded-md"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <a
                  href={submission.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open Original"
                  className="p-1.5 text-foreground/40 hover:text-foreground hover:bg-secondary/20 transition-colors rounded-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            <div className="grow w-full border border-border bg-black/5 flex items-center justify-center overflow-hidden min-h-[350px] lg:min-h-0">
              {submission.certificate_url?.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={submission.certificate_url}
                  className="w-full h-full border-none lg:min-h-[600px]"
                />
              ) : (
                <img
                  src={submission.certificate_url}
                  alt="Certificate"
                  className="max-w-full h-auto max-h-full object-contain"
                />
              )}
            </div>
          </div>

          {/* Bottom Right Actions */}
          <div className="mt-8 flex justify-end">
            {!(userRole === "student" && submission.status === "approved") && (
              <a
                href={window.location.pathname + "/edit"}
                className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-colors shadow-lg"
              >
                Edit Submission
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Full-Screen Modal */}
      {isFullViewOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 lg:p-12">
          <button
            onClick={() => setIsFullViewOpen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10000"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-full h-full max-w-6xl flex items-center justify-center overflow-hidden">
            {submission.certificate_url?.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={submission.certificate_url}
                className="w-full h-full border-none rounded-lg bg-white"
              />
            ) : (
              <img
                src={submission.certificate_url}
                alt="Certificate Full View"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
