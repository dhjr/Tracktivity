"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, UploadCloud, CheckCircle2 } from "lucide-react";

export default function StudentAddCertificatePage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const { id: batchId } = use(params);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    activity_id: "",
    name: "",
    category: "",
    date: "",
    file: null,
  });

  const [rulebook, setRulebook] = useState([]);
  const [fetchingRulebook, setFetchingRulebook] = useState(true);

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (
      user?.user_metadata?.role !== "student" &&
      user?.user_metadata?.role !== undefined
    ) {
      router.push("/faculty-dashboard");
    } else {
      setLoading(false);
      fetchRulebook();
    }
  }, [user, router]);

  const fetchRulebook = async () => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/rulebook`);
      if (res.ok) {
        const data = await res.json();
        // Flatten activities from various possible JSON structures
        let allActivities = [];
        const processCategories = (categories) => {
          if (Array.isArray(categories)) {
            categories.forEach((category) => {
              if (Array.isArray(category.activities)) {
                category.activities.forEach((act) => {
                  allActivities.push({
                    ...act,
                    categoryName: category.categoryName || category.groupId,
                  });
                });
              }
            });
          }
        };

        if (data && data.rulebook && Array.isArray(data.rulebook.categories)) {
          processCategories(data.rulebook.categories);
        } else if (data && Array.isArray(data.categories)) {
          processCategories(data.categories);
        } else if (
          data &&
          data.rulebook &&
          data.rulebook.content &&
          Array.isArray(data.rulebook.content.categories)
        ) {
          processCategories(data.rulebook.content.categories);
        } else if (
          data &&
          data.rulebook &&
          data.rulebook.data &&
          Array.isArray(data.rulebook.data.categories)
        ) {
          processCategories(data.rulebook.data.categories);
        } else if (Array.isArray(data.rulebook)) {
          allActivities = data.rulebook;
        } else if (Array.isArray(data)) {
          allActivities = data;
        }

        setRulebook(allActivities);
      }
    } catch (error) {
      console.error("Failed to fetch rulebook:", error);
    } finally {
      setFetchingRulebook(false);
    }
  };

  const handleActivityChange = (e) => {
    const selectedId = e.target.value;
    const selectedActivity = rulebook.find(
      (item) =>
        (item.id || item.activityId || item.code || item.activity_id) ===
        selectedId,
    );

    // Find the category/group if we can, else default to empty string
    let categoryName = "";
    if (selectedActivity) {
      if (selectedActivity.categoryName)
        categoryName = selectedActivity.categoryName;
      else if (selectedActivity.groupName)
        categoryName = selectedActivity.groupName;
      else if (selectedActivity.group_name)
        categoryName = selectedActivity.group_name;
      else categoryName = selectedActivity.groupId || "Assigned";
    }

    setFormData({
      ...formData,
      activity_id: selectedId,
      name: selectedActivity ? selectedActivity.title : "",
      category: categoryName,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Boilerplate submission logic
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);

      // Redirect back to batch page after 2 seconds
      setTimeout(() => {
        router.push(`/student-dashboard/batches/${batchId}`);
      }, 2000);
    }, 1500);
  };

  if (!user || loading || fetchingRulebook) {
    return (
      <div className="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <Link
          href={`/student-dashboard/batches/${batchId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Batch
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          Submit Certificate
        </h1>
        <p className="text-sm text-foreground/60 mt-2">
          Upload your certificate details and file for faculty review.
        </p>
      </div>

      {success ? (
        <div className="p-12 border border-green-500/20 bg-green-500/5 flex flex-col items-center justify-center text-center space-y-4">
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
          className="space-y-6 bg-background border border-border p-6 md:p-8 rounded-none"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="activity"
                className="block text-sm font-medium mb-1.5"
              >
                Certificate Name (Title)
              </label>
              <select
                id="activity"
                className="w-full px-4 py-2.5 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors appearance-none"
                value={formData.activity_id}
                onChange={handleActivityChange}
                required
              >
                <option value="" disabled>
                  Select an activity
                </option>
                {Array.isArray(rulebook) &&
                  rulebook.map((item) => {
                    const id =
                      item.id ||
                      item.activityId ||
                      item.code ||
                      item.activity_id ||
                      Math.random();
                    return (
                      <option key={id} value={id}>
                        {item.code ? `${item.code} - ` : ""}
                        {item.title || "Unknown Activity"}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium mb-1.5"
              >
                Category (Auto-assigned)
              </label>
              <input
                id="category"
                type="text"
                className="w-full px-4 py-2.5 text-sm bg-secondary/20 border border-border text-foreground/60 focus:outline-none transition-colors cursor-not-allowed"
                value={formData.category}
                readOnly
                placeholder="Category will appear here"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium mb-1.5"
              >
                Event Date
              </label>
              <input
                id="date"
                type="date"
                className="w-full px-4 py-2.5 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Upload Document (PDF/Image)
              </label>
              <div className="border-2 border-dashed border-border hover:border-foreground/50 transition-colors p-8 flex flex-col items-center justify-center text-center cursor-pointer group bg-secondary/5 relative">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, file: e.target.files[0] })
                  }
                  required
                />

                {formData.file ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500 mb-3" />
                    <p className="text-sm font-medium text-foreground">
                      {formData.file.name}
                    </p>
                    <p className="text-xs text-foreground/50 mt-1">
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-foreground/40 mt-3 group-hover:text-foreground/80 transition-colors underline underline-offset-4">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6 text-foreground/60" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-foreground/50 mt-1">
                      SVG, PNG, JPG or PDF (MAX. 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border mt-8">
            <Link
              href={`/student-dashboard/batches/${batchId}`}
              className="px-6 py-2.5 text-sm font-medium hover:bg-secondary/50 transition-colors border border-transparent"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-foreground text-background px-8 py-2.5 text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center min-w-[140px] disabled:opacity-50"
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
