"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { useRouter } from "next/navigation";
import { useEffect, useState, use, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, UploadCloud, CheckCircle2 } from "lucide-react";
import CalendarPicker from "@/components/CalendarPicker";
import PageLoader from "@/components/PageLoader";

export default function StudentAddCertificatePage({ params }) {
  const { user, isReady } = useRequireRole("student");
  const router = useRouter();
  const { id: batchId } = use(params);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    activity_id: "",
    name: "",
    category: "",
    groupId: "",
    date: "",
    file: null,
    level_key: "",
    points_awarded: 0,
    academic_year: 1,
  });

  const [rulebook, setRulebook] = useState([]);
  const [fetchingRulebook, setFetchingRulebook] = useState(true);
  const [selectedActivityDetails, setSelectedActivityDetails] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (isReady) {
      setLoading(false);
      fetchRulebook();
    }
  }, [isReady]);

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
        }
      }
    } catch (error) {
      console.error("Failed to fetch rulebook:", error);
    } finally {
      setFetchingRulebook(false);
    }
  };

  // Group activities by category for the dropdown
  const categories = useMemo(() => {
    return rulebook.reduce((acc, current) => {
      const catName = current.categoryName || "Other";
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(current);
      return acc;
    }, {});
  }, [rulebook]);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedActivityDetails(null);
    setFormData({
      ...formData,
      activity_id: "",
      name: "",
      category: category,
      groupId: "",
      level_key: "",
      points_awarded: 0,
    });
  };

  const handleActivityChange = (e) => {
    const selectedId = e.target.value;
    const selectedActivity = rulebook.find(
      (item) => (item.activityId || item.code) === selectedId,
    );

    if (selectedActivity) {
      const isLevelBased = selectedActivity.calculationType === "LEVEL";
      const isFixed = selectedActivity.calculationType === "FIXED";

      setSelectedActivityDetails(selectedActivity);

      let initialPoints = 0;
      if (isFixed) initialPoints = selectedActivity.points || 0;

      setFormData({
        ...formData,
        activity_id: selectedActivity.code,
        name: selectedActivity.title,
        category: selectedActivity.categoryName,
        groupId: selectedActivity.groupId,
        level_key: "",
        points_awarded: initialPoints,
      });
    }
  };

  const handleLevelChange = (e) => {
    const levelKey = e.target.value;
    let points = 0;

    if (selectedActivityDetails?.levels) {
      points = selectedActivityDetails.levels[levelKey] || 0;
    }

    setFormData({
      ...formData,
      level_key: levelKey,
      points_awarded: points,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) return;

    setIsSubmitting(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const submitData = new FormData();

      submitData.append("activity_code", formData.activity_id);
      submitData.append("group_name", formData.groupId);
      submitData.append("points_awarded", formData.points_awarded);
      if (formData.level_key) {
        submitData.append("level_key", formData.level_key);
      }
      submitData.append("student_id", user.id);
      submitData.append("academic_year", formData.academic_year);
      submitData.append("file", formData.file);

      const res = await fetch(`${API_URL}/student/submit`, {
        method: "POST",
        body: submitData,
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/student-dashboard/batches/${batchId}`);
        }, 2000);
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || "Failed to submit certificate"}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || loading || fetchingRulebook) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full max-w-3xl mx-auto p-4 md:p-6 pt-8 md:pt-12">
      <div className="mb-4">
        <h1 className="text-xl font-medium tracking-tight text-foreground">
          Submit Certificate
        </h1>
        <p className="text-xs text-foreground/60 mt-0.5">
          Upload your certificate details and file for faculty review.
        </p>
      </div>

      {success ? (
        <div className="p-10 border border-green-500/20 bg-green-500/5 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-medium text-foreground">
            Certificate Submitted!
          </h2>
          <p className="text-sm text-foreground/60">
            Your certificate is now pending review by your faculty. You will be
            redirected shortly...
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-background border border-border p-5 md:p-6 rounded-none"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="category-select"
                  className="block text-sm font-medium mb-1"
                >
                  Category
                </label>
                <select
                  id="category-select"
                  className="w-full px-4 py-1.5 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors appearance-none"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  required
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {Object.keys(categories).map((catName) => (
                    <option key={catName} value={catName}>
                      {catName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="activity"
                  className="block text-sm font-medium mb-1"
                >
                  Specific Activity
                </label>
                <select
                  id="activity"
                  className={`w-full px-4 py-1.5 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors appearance-none ${
                    !selectedCategory ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  value={
                    selectedActivityDetails?.activityId ||
                    selectedActivityDetails?.code ||
                    ""
                  }
                  onChange={handleActivityChange}
                  required
                  disabled={!selectedCategory}
                >
                  <option value="" disabled>
                    {selectedCategory ? "Select an activity" : "Select category first"}
                  </option>
                  {selectedCategory &&
                    categories[selectedCategory].map((item) => (
                      <option
                        key={item.activityId || item.code}
                        value={item.activityId || item.code}
                      >
                        {item.title}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedActivityDetails?.calculationType === "LEVEL" ? (
                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                  <div>
                    <label
                      htmlFor="level"
                      className="block text-sm font-medium mb-1"
                    >
                      Level
                    </label>
                    <select
                      id="level"
                      className="w-full px-4 py-1.5 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors"
                      value={formData.level_key}
                      onChange={handleLevelChange}
                      required
                    >
                      <option value="" disabled>
                        Select Level
                      </option>
                      {Object.keys(selectedActivityDetails.levels).map((level) => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)} - (
                          {selectedActivityDetails.levels[level]} Points)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="points"
                      className="block text-sm font-medium mb-1"
                    >
                      Points (Max: {selectedActivityDetails?.maxPoints || 0})
                    </label>
                    <input
                      id="points"
                      type="number"
                      readOnly
                      className="w-full px-4 py-1.5 text-sm bg-secondary/20 border border-border text-foreground/60 focus:outline-none cursor-not-allowed"
                      value={formData.points_awarded}
                    />
                  </div>
                </div>
              ) : (
                <div className="md:col-span-1">
                  <label
                    htmlFor="points"
                    className="block text-sm font-medium mb-1"
                  >
                    Points to be Awarded
                  </label>
                  <div className="relative">
                    <input
                      id="points"
                      type="number"
                      readOnly
                      className="w-full px-4 py-1.5 text-sm bg-secondary/20 border border-border text-foreground/60 focus:outline-none cursor-not-allowed"
                      value={formData.points_awarded}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-foreground/40 uppercase tracking-wider font-bold">
                      Max: {selectedActivityDetails?.maxPoints || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="academic_year"
                  className="block text-sm font-medium mb-1"
                >
                  Academic Year
                </label>
                <select
                  id="academic_year"
                  className="w-full px-4 py-1.5 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors"
                  value={formData.academic_year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      academic_year: parseInt(e.target.value),
                    })
                  }
                  required
                >
                  {[1, 2, 3, 4].map((year) => (
                    <option key={year} value={year}>
                      Regular Year {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <CalendarPicker
                  label="Certificate Date"
                  value={formData.date}
                  onChange={(date) => setFormData({ ...formData, date })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Upload Certificate
              </label>
              <div className="border-2 border-dashed border-border hover:border-foreground/50 transition-colors p-4 flex flex-col items-center justify-center text-center cursor-pointer group bg-secondary/5 relative">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept=".pdf,image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, file: e.target.files[0] })
                  }
                  required
                />

                {formData.file ? (
                  <div className="flex flex-col items-center relative z-0">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mb-1" />
                    <p className="text-[10px] font-medium text-foreground line-clamp-1 max-w-[200px]">
                      {formData.file.name}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center relative z-0">
                    <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center mb-2">
                      <UploadCloud className="w-4 h-4 text-foreground/60" />
                    </div>
                    <p className="text-xs font-medium text-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[10px] text-foreground/50 mt-0.5">
                      PDF, JPG, PNG or WebP (MAX. 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-border mt-2">
            <button
              onClick={() => router.back()}
              type="button"
              className="px-6 py-2 text-sm font-medium hover:bg-secondary/50 transition-colors border border-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-foreground text-background px-8 py-2 text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center min-w-[160px] disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Submit Certificate"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
