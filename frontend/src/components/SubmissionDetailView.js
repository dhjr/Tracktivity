"use client";

import {
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ExternalLink,
  Clock,
} from "lucide-react";
import { formatDate } from "@/utils/helpers";

export default function SubmissionDetailView({
  submission,
  rule,
  extraInfo, // Slot for top of left column (e.g. Student Info)
  footer, // Slot for bottom of left column (e.g. Verification actions)
  userRole = "student", // Add role to control edit permission
}) {
  if (!submission) return null;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header with Status */}
      <div className="flex items-center justify-between mb-6">
        <div />
        <div className="flex items-center gap-3">
          {submission.status === "pending" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">
              <Clock className="w-3.5 h-3.5" /> Pending Review
            </span>
          )}
          {submission.status === "approved" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
            </span>
          )}
          {submission.status === "rejected" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
              <XCircle className="w-3.5 h-3.5" /> Rejected
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
        {/* Left Column: Details */}
        <div className="space-y-6">
          {extraInfo}

          <section>
            <div className="p-6 border border-border bg-background space-y-8">
              <div>
                <p className="text-xs text-foreground/50 uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> Managed Activity
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
                  <p className="text-sm font-mono bg-secondary/30 px-2 py-1 inline-block border border-border/50">
                    {submission.activity_id}
                  </p>
                </div>
                
                <div>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1.5 font-bold">
                    Category Group
                  </p>
                  <p className="text-sm font-medium">
                    {submission.group_name}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1.5 font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Academic Year
                  </p>
                  <p className="text-sm font-medium">
                    Year {submission.academic_year}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1.5 font-bold flex items-center gap-1">
                    <Award className="w-3 h-3" /> Points Earned
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
                    Certificate Date
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
          <div className="space-y-4 grow">
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/30 flex items-center justify-between">
              <a
                href={submission.certificate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] underline hover:text-foreground transition-colors flex items-center gap-1"
              >
                Open Original <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </h2>
            <div className="aspect-4/5 lg:aspect-3/4 w-full border border-border bg-black/5 flex items-center justify-center overflow-hidden">
              {submission.certificate_url?.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={submission.certificate_url}
                  className="w-full h-full border-none"
                />
              ) : (
                <img
                  src={submission.certificate_url}
                  alt="Certificate"
                  className="max-w-full max-h-full object-contain shadow-2xl"
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
    </div>
  );
}
