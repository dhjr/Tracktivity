"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, UploadCloud, CheckCircle2, FileText, Activity, MessageSquare } from "lucide-react";
import CalendarPicker from "./CalendarPicker";

export default function CertificateForm({
  initialData = null,
  onSubmit,
  isSubmitting = false,
  isFaculty = false,
  footer,
}) {
  const [formData, setFormData] = useState({
    activity_id: initialData?.activity_id || "",
    name: initialData?.name || "",
    category: initialData?.category || "",
    groupId: initialData?.group_name || "",
    date: initialData?.certificate_date || "",
    file: null,
    level_key: initialData?.level || "",
    points_awarded: initialData?.points_awarded || 0,
    academic_year: initialData?.academic_year || 1,
    comments: initialData?.comments || "",
  });

  const [rulebook, setRulebook] = useState([]);
  const [fetchingRulebook, setFetchingRulebook] = useState(true);
  const [selectedActivityDetails, setSelectedActivityDetails] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(initialData?.category || "");

  useEffect(() => {
    fetchRulebook();
  }, []);

  const fetchRulebook = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/rulebook`);
      if (res.ok) {
        const data = await res.json();
        const rulebookData = data.rulebook || data;

        if (rulebookData.categories) {
          const flattened = [];
          rulebookData.categories.forEach((cat) => {
            if (Array.isArray(cat.activities)) {
              cat.activities.forEach((act) => {
                flattened.push({
                  ...act,
                  categoryName: cat.categoryName,
                  groupId: cat.groupId,
                });
              });
            }
          });
          setRulebook(flattened);
          
          // If editing, find the activity details and set category
          if (initialData?.activity_id) {
            const initialAct = flattened.find(
              (item) => (item.activityId || item.code) === initialData.activity_id
            );
            if (initialAct) {
              setSelectedActivityDetails(initialAct);
              setSelectedCategory(initialAct.categoryName);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch rulebook:", error);
    } finally {
      setFetchingRulebook(false);
    }
  };

  const categories = useMemo(() => {
    return rulebook.reduce((acc, current) => {
      const catName = current.categoryName || "Other";
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(current);
      return acc;
    }, {});
  }, [rulebook]);

  const handleCategoryChange = (e) => {
    if (isFaculty) return; // Faculty shouldn't change the category of an existing submission usually? 
    // Actually, user said "edit option can look exactly like the upload page itself".
    
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedActivityDetails(null);
    setFormData((prev) => ({
      ...prev,
      activity_id: "",
      name: "",
      category: category,
      groupId: "",
      level_key: "",
      points_awarded: 0,
    }));
  };

  const handleActivityChange = (e) => {
    if (isFaculty) return;
    
    const selectedId = e.target.value;
    const selectedActivity = rulebook.find(
      (item) => (item.activityId || item.code) === selectedId
    );

    if (selectedActivity) {
      const isFixed = selectedActivity.calculationType === "FIXED";
      setSelectedActivityDetails(selectedActivity);

      let initialPoints = 0;
      if (isFixed) initialPoints = selectedActivity.points || 0;

      setFormData((prev) => ({
        ...prev,
        activity_id: selectedActivity.code,
        name: selectedActivity.title,
        category: selectedActivity.categoryName,
        groupId: selectedActivity.groupId,
        level_key: "",
        points_awarded: initialPoints,
      }));
    }
  };

  const handleLevelChange = (e) => {
    if (isFaculty) return;
    
    const levelKey = e.target.value;
    let points = 0;

    if (selectedActivityDetails?.levels) {
      points = selectedActivityDetails.levels[levelKey] || 0;
    }

    setFormData((prev) => ({
      ...prev,
      level_key: levelKey,
      points_awarded: points,
    }));
  };

  const isFormValid = useMemo(() => {
    if (isFaculty) return true; // Faculty can always comment/status
    
    const basicFields =
      formData.activity_id &&
      formData.category &&
      formData.name &&
      formData.date &&
      (initialData || formData.file); // file required only for new upload

    if (selectedActivityDetails?.calculationType === "LEVEL") {
      return !!(basicFields && formData.level_key);
    }

    return !!basicFields;
  }, [formData, selectedActivityDetails, initialData, isFaculty]);

  const onLocalSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    onSubmit(formData);
  };

  if (fetchingRulebook) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-foreground/40" />
      </div>
    );
  }

  return (
    <form onSubmit={onLocalSubmit} className="space-y-6">
      <div className="bg-background border border-border p-5 md:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category-select" className="block text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1.5">
              Category
            </label>
            <select
              id="category-select"
              className="w-full px-4 py-2 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors appearance-none"
              value={selectedCategory}
              onChange={handleCategoryChange}
              required
            >
              <option value="" disabled>Select category</option>
              {Object.keys(categories).map((catName) => (
                <option key={catName} value={catName}>{catName}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="activity" className="block text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1.5">
              Specific Activity
            </label>
            <select
              id="activity"
              className={`w-full px-4 py-2 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors appearance-none ${!selectedCategory ? "opacity-50 cursor-not-allowed" : ""}`}
              value={selectedActivityDetails?.activityId || selectedActivityDetails?.code || ""}
              onChange={handleActivityChange}
              required
              disabled={!selectedCategory}
            >
              <option value="" disabled>
                {selectedCategory ? "Select an activity" : "Select category first"}
              </option>
              {selectedCategory && categories[selectedCategory].map((item) => (
                <option key={item.activityId || item.code} value={item.activityId || item.code}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedActivityDetails?.documentaryEvidence && !isFaculty && (
          <div className="flex gap-3 p-3 bg-foreground/5 border border-border">
            <FileText className="w-4 h-4 text-foreground/40 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Required Evidence</p>
              <p className="text-xs text-foreground/80 leading-relaxed">{selectedActivityDetails.documentaryEvidence}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedActivityDetails?.calculationType === "LEVEL" ? (
            <>
              <div>
                <label htmlFor="level" className="block text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1.5">
                  Level
                </label>
                <select
                  id="level"
                  className="w-full px-4 py-2 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors"
                  value={formData.level_key}
                  onChange={handleLevelChange}
                  required
                >
                  <option value="" disabled>Select Level</option>
                  {Object.keys(selectedActivityDetails.levels).map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)} - ({selectedActivityDetails.levels[level]} Points)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="points" className="block text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1.5">
                  Points (Max: {selectedActivityDetails?.maxPoints || 0})
                </label>
                <input
                  id="points"
                  type="number"
                  readOnly
                  className="w-full px-4 py-2 text-sm bg-secondary/20 border border-border text-foreground/60 focus:outline-none cursor-not-allowed"
                  value={formData.points_awarded}
                />
              </div>
            </>
          ) : (
            <div className="md:col-span-1">
              <label htmlFor="points" className="block text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1.5">
                Points to be Awarded
              </label>
              <div className="relative">
                <input
                  id="points"
                  type="number"
                  readOnly
                  className="w-full px-4 py-2 text-sm bg-secondary/20 border border-border text-foreground/60 focus:outline-none cursor-not-allowed"
                  value={formData.points_awarded}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-foreground/40 uppercase tracking-wider font-bold">
                  Max: {selectedActivityDetails?.maxPoints || 0}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="academic_year" className="block text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1.5">
              Academic Year
            </label>
            <select
              id="academic_year"
              className="w-full px-4 py-2 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors"
              value={formData.academic_year}
              onChange={(e) => setFormData((prev) => ({ ...prev, academic_year: parseInt(e.target.value) }))}
              required
            >
              {[1, 2, 3, 4].map((year) => (
                <option key={year} value={year}>Regular Year {year}</option>
              ))}
            </select>
          </div>

          <div>
            <CalendarPicker
              label="Certificate Date"
              value={formData.date}
              onChange={(date) => setFormData((prev) => ({ ...prev, date }))}
            />
          </div>
        </div>

        {!isFaculty && (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1.5">
              Upload Certificate {initialData && "(Optional if keeping existing)"}
            </label>
            <div className="border-2 border-dashed border-border hover:border-foreground/50 transition-colors p-6 flex flex-col items-center justify-center text-center cursor-pointer group bg-secondary/5 relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                accept=".pdf,image/*"
                onChange={(e) => setFormData((prev) => ({ ...prev, file: e.target.files[0] }))}
                required={!initialData}
              />

              {formData.file ? (
                <div className="flex flex-col items-center relative z-0">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                  <p className="text-xs font-medium text-foreground line-clamp-1 max-w-[250px]">{formData.file.name}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center relative z-0">
                  <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center mb-3">
                    <UploadCloud className="w-5 h-5 text-foreground/60" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                  <p className="text-[10px] text-foreground/50 mt-1">PDF, JPG, PNG or WebP (MAX. 5MB)</p>
                </div>
              )}
            </div>
          </div>
        )}

        {isFaculty && (
          <div className="pt-6 border-t border-border space-y-4">
            <div>
              <label htmlFor="comments" className="block text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1.5 items-center gap-2">
                <MessageSquare className="w-3 h-3" /> Faculty Comments
              </label>
              <textarea
                id="comments"
                rows={4}
                className="w-full px-4 py-3 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors resize-none italic"
                placeholder="Add feedback for the student..."
                value={formData.comments}
                onChange={(e) => setFormData((prev) => ({ ...prev, comments: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-4">
        {footer}
      </div>
    </form>
  );
}
