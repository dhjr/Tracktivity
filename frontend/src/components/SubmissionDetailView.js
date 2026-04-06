"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  FileText,
  Activity,
  Award,
  Calendar,
  MessageSquare,
  ExternalLink,
  Maximize2,
  X,
  Edit2,
  Check,
  RotateCcw,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { formatDate } from "@/utils/helpers";
import StatusBadge from "./StatusBadge";
import { useRulebook } from "@/hooks/useRulebook";
import Select from "@/components/ui/Select";

export default function SubmissionDetailView({
  submission,
  rule,
  extraInfo, // Slot for top of left column (e.g. Student Info)
  footer, // Slot for bottom of left column (e.g. Verification actions)
  userRole = "student", // Add role to control edit permission
  onUpdate, // Callback for saving inline edits
}) {
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const { rulebook, categories, findActivity } = useRulebook();

  // Initialize edit data & category when starting to edit
  useEffect(() => {
    if (submission) {
      setEditData({
        activity_id: submission.activity_id,
        activity_name: submission.activity_name,
        group_name: submission.group_name,
        academic_year: submission.academic_year,
        level: submission.level,
        points_awarded: submission.points_awarded,
        certificate_date: submission.certificate_date,
      });

      // Find the category for current activity
      const act = findActivity(submission.activity_id);
      if (act) setSelectedCategory(act.categoryName);
    }
  }, [submission, findActivity]);

  const toggleEdit = () => {
    if (isEditing) {
      // Revert editData, Category, and File if cancelling
      const act = findActivity(submission.activity_id);
      if (act) setSelectedCategory(act.categoryName);
      setNewFile(null);
      setFilePreview(null);

      setEditData({
        activity_id: submission.activity_id,
        activity_name: submission.activity_name,
        group_name: submission.group_name,
        academic_year: submission.academic_year,
        level: submission.level,
        points_awarded: submission.points_awarded,
        certificate_date: submission.certificate_date,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    setIsSubmitting(true);
    try {
      await onUpdate({ ...editData, newFile });
      setNewFile(null);
      setFilePreview(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const currentActivityRule = useMemo(() => {
    if (!editData?.activity_id) return null;
    return findActivity(editData.activity_id);
  }, [editData?.activity_id, findActivity]);

  const viewActivityRule = useMemo(() => {
    if (!submission?.activity_id) return null;
    return findActivity(submission.activity_id);
  }, [submission?.activity_id, findActivity]);

  const effectiveRule = isEditing ? currentActivityRule : viewActivityRule;

  if (!submission) return null;

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 pb-8">
        {/* Left Column: Details */}
        <div className="space-y-6">
          {extraInfo}

          <section>
            <div className="p-6 border border-border bg-background space-y-8 relative group/card">
              <div>
                <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-2">
                  {isEditing
                    ? "Category"
                    : findActivity(submission.activity_id)?.categoryName ||
                      "Category"}
                </p>
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setEditData((prev) => ({
                          ...prev,
                          activity_id: "",
                          activity_name: "",
                          points_awarded: 0,
                        }));
                      }}
                      placeholder="Select Category"
                      options={Object.keys(categories).map((catName) => ({
                        label: catName,
                        value: catName,
                      }))}
                    />
                    <Select
                      value={editData.activity_id}
                      disabled={!selectedCategory}
                      placeholder="Select Activity"
                      onChange={(e) => {
                        const act = findActivity(e.target.value);
                        setEditData((prev) => ({
                          ...prev,
                          activity_id: e.target.value,
                          activity_name: act?.title || prev.activity_name,
                          group_name: act?.groupId || prev.group_name,
                          points_awarded:
                            act?.calculationType === "FIXED" ? act.points : 0,
                        }));
                      }}
                      options={(categories[selectedCategory] || []).map(
                        (act) => ({
                          label: act.title,
                          value: act.code,
                        }),
                      )}
                    />
                  </div>
                ) : (
                  <h1 className="font-bold text-3xl leading-tight text-foreground tracking-tight">
                    {submission.activity_name}
                  </h1>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                <div>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1.5 font-bold">
                    Activity Code
                  </p>
                  <p className="text-sm font-medium">
                    {isEditing ? editData.activity_id : submission.activity_id}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1.5 font-bold">
                    Group
                  </p>
                  <p className="text-sm font-medium">
                    {isEditing ? editData.group_name : submission.group_name}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1.5 font-bold flex items-center gap-1">
                    Academic Year
                  </p>
                  {isEditing ? (
                    <Select
                      value={editData.academic_year}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          academic_year: parseInt(e.target.value),
                        }))
                      }
                      options={[1, 2, 3, 4].map((y) => ({
                        label: `Year ${y}`,
                        value: y,
                      }))}
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      Year {submission.academic_year}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1.5 font-bold flex items-center gap-1">
                    Points Earned
                  </p>
                  {isEditing ? (
                    <div className="space-y-1">
                      {currentActivityRule?.calculationType === "LEVEL" ? (
                        <Select
                          value={editData.level}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              level: e.target.value,
                              points_awarded:
                                currentActivityRule.levels[e.target.value] || 0,
                            }))
                          }
                          options={Object.keys(currentActivityRule.levels).map(
                            (l) => ({
                              label: `${l.toUpperCase()} (${currentActivityRule.levels[l]} pts)`,
                              value: l,
                            }),
                          )}
                        />
                      ) : (
                        <div className="relative">
                          <input
                            type="number"
                            value={editData.points_awarded}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                points_awarded: parseInt(e.target.value),
                              }))
                            }
                            readOnly={
                              currentActivityRule?.calculationType === "FIXED"
                            }
                            className={`w-full px-4 py-2 text-sm border border-border focus:outline-none ${currentActivityRule?.calculationType === "FIXED" ? "bg-secondary/20" : "bg-background"}`}
                          />
                          {currentActivityRule?.maxPoints && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-foreground/30 font-bold">
                              MAX: {currentActivityRule.maxPoints}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-black text-green-500">
                        {submission.points_awarded}
                      </p>
                      {(effectiveRule?.maxPoints ||
                        effectiveRule?.max_points) && (
                        <p className="text-[10px] text-foreground/30">
                          /{" "}
                          {effectiveRule.maxPoints || effectiveRule.max_points}{" "}
                          MAX
                        </p>
                      )}
                    </div>
                  )}
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

                {isEditing && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleEdit}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground/40 hover:text-foreground transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors shadow-lg disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Save Changes
                    </button>
                  </div>
                )}
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
          <div className="space-y-4 grow flex flex-col h-full">
            <div className="flex items-center justify-between">
              <StatusBadge status={submission.status} />
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={toggleEdit}
                    title="Correct Submission"
                    className="p-1.5 text-foreground/40 hover:text-foreground hover:bg-secondary/20 transition-colors rounded-md"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
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

            <div className="grow w-full border border-border bg-black/5 flex items-center justify-center overflow-hidden min-h-[350px] relative group/preview">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,image/*"
                onChange={handleFileChange}
              />

              {isEditing && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer opacity-100 transition-all hover:bg-black/50"
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white text-xs font-bold uppercase tracking-widest">
                    {newFile ? "Change File" : "Update Certificate"}
                  </p>
                  {newFile && (
                    <p className="text-white/60 text-[10px] mt-1 italic max-w-[200px] truncate px-4">
                      {newFile.name}
                    </p>
                  )}
                </div>
              )}

              {filePreview ? (
                <img
                  src={filePreview}
                  alt="New Certificate Preview"
                  className="max-w-full h-auto max-h-full object-contain"
                />
              ) : newFile && newFile.type === "application/pdf" ? (
                <div className="flex flex-col items-center gap-3">
                  <FileText className="w-12 h-12 text-foreground/20" />
                  <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
                    PDF Selected
                  </p>
                </div>
              ) : (
                <>
                  {submission.certificate_url
                    ?.toLowerCase()
                    .endsWith(".pdf") ? (
                    <iframe
                      src={submission.certificate_url}
                      className="w-full h-full border-none lg:min-h-[500px]"
                    />
                  ) : (
                    <img
                      src={submission.certificate_url}
                      alt="Certificate"
                      className="max-w-full h-auto max-h-full object-contain"
                    />
                  )}
                </>
              )}
            </div>
          </div>
          <div className="mt-8" />
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
