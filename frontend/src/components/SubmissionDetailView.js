"use client";

import {
  FileText,
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ExternalLink,
  Clock,
} from "lucide-react";

export default function SubmissionDetailView({
  submission,
  rule,
  extraInfo, // Slot for top of left column (e.g. Student Info)
  footer,    // Slot for bottom of left column (e.g. Verification actions)
  userRole = "student", // Add role to control edit permission
}) {
  if (!submission) return null;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header with Status and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => window.history.back()}
            className="text-xs text-foreground/40 hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        </div>
        <div className="flex items-center gap-4">
          {!(userRole === "student" && submission.status === "approved") && (
            <a
              href={window.location.pathname + "/edit"}
              className="text-xs font-medium px-4 py-1.5 border border-border hover:bg-secondary/50 transition-colors"
            >
              Edit Submission
            </a>
          )}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
        {/* Left Column: Details */}
        <div className="space-y-6">
          {extraInfo}

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/30 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Activity Details
            </h2>
            <div className="p-5 border border-border bg-background space-y-4">
              <div>
                <p className="text-xs text-foreground/50 uppercase tracking-wider mb-1">
                  Activity Name
                </p>
                <p className="font-medium text-lg leading-tight">
                  {submission.activity_name}
                </p>
                <p className="text-xs text-foreground/40 mt-1">
                  Code: {submission.activity_id} • Group: {submission.group_name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-foreground/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Points
                  </p>
                  <p className="text-2xl font-bold text-green-500">
                    {submission.points_awarded}
                  </p>
                  {(rule?.maxPoints || rule?.max_points) && (
                    <p className="text-[10px] text-foreground/40">
                      Rulebook Max: {rule.maxPoints || rule.max_points}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-foreground/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Year/Level
                  </p>
                  <p className="text-lg font-medium">
                    Year {submission.academic_year}
                  </p>
                  {submission.level && (
                    <p className="text-xs text-foreground/50 capitalize font-medium">
                      Level: {submission.level}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-foreground/50 uppercase tracking-wider mb-1">
                  Certificate Date
                </p>
                <p className="text-sm font-medium italic">
                  {new Date(submission.certificate_date).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
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
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/30 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Certificate Evidence
            </span>
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
      </div>
    </div>
  );
}
