"use client";

import { useState, useEffect, useMemo } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import CalendarPicker from "./CalendarPicker";
import Select from "@/components/ui/Select";
import CertificateFormSkeleton from "@/components/skeletons/CertificateFormSkeleton";

export default function CertificateForm({
  initialData = null,
  onSubmit,
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

  const [filePreview, setFilePreview] = useState(null);

  const [rulebook, setRulebook] = useState([]);
  const [fetchingRulebook, setFetchingRulebook] = useState(true);
  const [selectedActivityDetails, setSelectedActivityDetails] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(
    initialData?.category || "",
  );

  useEffect(() => {
    fetchRulebook();
  }, []);

  const fetchRulebook = async () => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
              (item) =>
                (item.activityId || item.code) === initialData.activity_id,
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
      (item) => (item.activityId || item.code) === selectedId,
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, file: null }));
    setFilePreview(null);
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
    return <CertificateFormSkeleton />;
  }

  return (
    <form onSubmit={onLocalSubmit} className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-7">
          <div className="p-6 md:p-8 bg-background border border-border space-y-6 relative group/card">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="category-select"
                    className="block text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2"
                  >
                    Select Category
                  </label>
                  <Select
                    id="category-select"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    placeholder="Select category"
                    options={Object.keys(categories).map((catName) => ({
                      label: catName,
                      value: catName,
                    }))}
                  />
                </div>

                <div>
                  <label
                    htmlFor="activity"
                    className="block text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2"
                  >
                    Select activity
                  </label>
                  <Select
                    id="activity"
                    value={
                      selectedActivityDetails?.activityId ||
                      selectedActivityDetails?.code ||
                      ""
                    }
                    onChange={handleActivityChange}
                    disabled={!selectedCategory}
                    placeholder={
                      selectedCategory ? "Select activity" : "Choose category"
                    }
                    options={
                      selectedCategory
                        ? categories[selectedCategory].map((item) => ({
                            label: item.title,
                            value: item.activityId || item.code,
                          }))
                        : []
                    }
                  />
                </div>
              </div>

              {selectedActivityDetails?.documentaryEvidence && !isFaculty && (
                <div className="flex gap-4 p-4 bg-secondary/10 border border-border/50 animate-in fade-in duration-500">
                  <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                      Required certificate
                    </p>
                    <p className="text-xs text-foreground/80 leading-relaxed italic">
                      {selectedActivityDetails.documentaryEvidence}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {selectedActivityDetails?.calculationType === "LEVEL" ? (
                  <>
                    <div>
                      <label
                        htmlFor="level"
                        className="block text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2"
                      >
                        3. Achievement Level
                      </label>
                      <Select
                        id="level"
                        value={formData.level_key}
                        onChange={handleLevelChange}
                        placeholder="Select Level"
                        options={Object.keys(
                          selectedActivityDetails.levels,
                        ).map((level) => ({
                          label: `${level.charAt(0).toUpperCase() + level.slice(1)} - (${selectedActivityDetails.levels[level]} pts)`,
                          value: level,
                        }))}
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label
                      htmlFor="points"
                      className="block text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2"
                    >
                      Recommended points
                    </label>
                    <div className="relative">
                      <input
                        id="points"
                        type="number"
                        readOnly
                        className="w-full px-4 py-2.5 text-sm bg-secondary/5 border border-border text-foreground/40 focus:outline-none cursor-not-allowed font-mono"
                        value={formData.points_awarded}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-foreground/30 uppercase tracking-widest font-bold">
                        MAX: {selectedActivityDetails?.maxPoints || 0}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="academic_year"
                    className="block text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2"
                  >
                    Academic Year
                  </label>
                  <Select
                    id="academic_year"
                    value={formData.academic_year}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        academic_year: parseInt(e.target.value),
                      }))
                    }
                    options={[1, 2, 3, 4].map((year) => ({
                      label: `Year ${year}`,
                      value: year,
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CalendarPicker
                  label="Certificate Date"
                  value={formData.date}
                  onChange={(date) =>
                    setFormData((prev) => ({ ...prev, date }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Upload & Live Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex flex-col h-full">
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-4 flex items-center gap-2">
              Upload certificate
            </p>

            <div
              className={`grow border-2 border-dashed transition-all duration-500 relative min-h-[400px] flex items-center justify-center overflow-hidden
                ${formData.file ? "border-primary/20 bg-background" : "border-border hover:border-primary/30 bg-secondary/5 hover:bg-secondary/10"}`}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                required={!initialData}
              />

              {formData.file ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 animate-in zoom-in-95 duration-300">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-w-full h-auto max-h-full object-contain shadow-2xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center">
                        <FileText className="w-10 h-10 text-foreground/40" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest text-foreground/60">
                        {formData.file.name.split(".").pop().toUpperCase()}{" "}
                        Selected
                      </p>
                    </div>
                  )}

                  <button
                    onClick={removeFile}
                    className="absolute top-4 right-4 z-30 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110 active:scale-95"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md p-3 border-t border-border">
                    <p className="text-[10px] font-bold text-foreground/40 uppercase truncate">
                      {formData.file.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 group-hover:scale-105 transition-transform duration-500">
                  <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center shadow-sm group-hover:shadow-primary/10">
                    <UploadCloud className="w-6 h-6 text-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-sm font-bold uppercase tracking-wider text-foreground">
                      Upload Certificate
                    </p>
                    <p className="text-[10px] text-foreground/40 mt-1 uppercase tracking-widest font-medium">
                      PDF, JPG, PNG or WebP (MAX. 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {footer}
        </div>
      </div>
    </form>
  );
}
