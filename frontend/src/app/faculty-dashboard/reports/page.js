"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { getAuthHeaders } from "@/utils/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Users,
  BarChart3,
  List,
  Loader2,
  ChevronDown,
  Activity,
  NotepadText,
  FileDown,
} from "lucide-react";
import Select from "@/components/ui/Select";
import ReportsSkeleton from "@/components/skeletons/ReportsSkeleton";

export default function ReportsPage() {
  const { user, isReady } = useRequireRole("faculty");
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [downloading, setDownloading] = useState({ type: "", format: "" });

  const yearOptions = [1, 2, 3, 4, 5];

  useEffect(() => {
    if (isReady) fetchBatches();
  }, [isReady]);

  const fetchBatches = async () => {
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const res = await fetch(`${API_URL}/faculty/my-batches`, { headers });
      if (!res.ok) throw new Error("Failed to fetch batches");
      const data = await res.json();
      setBatches(data.batches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBatches(false);
    }
  };

  const downloadReport = async (reportType, format) => {
    if (!selectedBatch) return;

    setDownloading({ type: reportType, format });
    try {
      const { headers, API_URL } = await getAuthHeaders();
      let url = `${API_URL}/faculty/batches/${selectedBatch}/reports/${reportType}?format=${format}`;

      if (
        selectedYear &&
        (reportType === "category-breakdown" ||
          reportType === "activity-breakdown")
      ) {
        url += `&academic_year=${selectedYear}`;
      }

      const res = await fetch(url, { headers });

      if (!res.ok) throw new Error("Failed to download report");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${reportType}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download report. Please try again.");
    } finally {
      setDownloading({ type: "", format: "" });
    }
  };

  const reports = [
    {
      id: "student-summary",
      title: "Student Point Summary",
      description:
        "Overview of all students with their total points across all groups",
      icon: Users,
    },
    {
      id: "category-breakdown",
      title: "Category-wise Point Breakdown",
      description:
        "Detailed breakdown of points earned by each student per activity category",
      icon: BarChart3,
    },
    {
      id: "activity-breakdown",
      title: "Activity-wise Point Breakdown",
      description:
        "Comprehensive view of all approved activities with points awarded",
      icon: List,
    },
  ];

  if (!user || loadingBatches) return <ReportsSkeleton />;

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full relative bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <div className="flex items-center gap-2 mb-2"></div>
            <h1 className="text-4xl font-display font-medium tracking-tight text-foreground">
              Analytics & Reports
            </h1>
            <p className="text-sm text-foreground/75 mt-1 font-light italic">
              Generate and export comprehensive batch performance data.
            </p>
          </div>

          {/* Selectors Group */}
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
            {/* Batch Selector */}
            <div className="w-full md:w-64 group">
              <Select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                placeholder="Select a Batch"
                leftIcon={Users}
                options={batches.map((batch) => ({
                  label: batch.name,
                  value: batch.id,
                }))}
              />
            </div>

            {/* Year Selector */}
            <div className="w-full md:w-48 group">
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                placeholder="All Years"
                leftIcon={Activity}
                options={yearOptions.map((year) => ({
                  label: `Academic Year ${year}`,
                  value: year,
                }))}
              />
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        {!selectedBatch ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center bg-secondary/5 border border-border/30 border-dashed rounded-4xl backdrop-blur-sm animate-in fade-in duration-1000">
            <div className="w-20 h-20 bg-background rounded-3xl border border-border/50 flex items-center justify-center mb-6 shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <NotepadText className="w-8 h-8 text-foreground/30 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h3 className="text-xl font-display font-medium text-foreground/75 mb-2">
              No batch selected.
            </h3>
            <p className="text-sm text-foreground/50 font-light max-w-sm leading-relaxed">
              Select a batch and year from the dropdown above to view the report
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            {reports.map((report) => {
              const Icon = report.icon;
              const isDownloading = downloading.type === report.id;

              return (
                <div
                  key={report.id}
                  className="p-8 bg-secondary/5 border border-border/50 backdrop-blur-xl rounded-4xl flex flex-col justify-between hover:shadow-2xl hover:border-border transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-foreground/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-background border border-border/50 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      <Icon className="w-6 h-6 text-foreground/70" />
                    </div>
                    <h3 className="font-display font-bold text-xl tracking-tight text-foreground/90 group-hover:text-foreground transition-colors mb-2">
                      {report.title}
                    </h3>
                    <p className="text-xs text-foreground/60 font-light leading-relaxed mb-8">
                      {report.description}
                    </p>
                  </div>

                  <div className="relative z-10 pt-4 border-t border-border/20 flex gap-3">
                    <button
                      onClick={() => downloadReport(report.id, "csv")}
                      disabled={isDownloading}
                      className="flex-1 py-3 px-4 bg-background border border-border/50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:bg-secondary/10 hover:text-foreground transition-all flex items-center justify-center gap-2 disabled:opacity-30 active:scale-[0.98]"
                    >
                      {isDownloading && downloading.format === "csv" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileDown className="w-3.5 h-3.5" />
                      )}
                      CSV
                    </button>
                    <button
                      onClick={() => downloadReport(report.id, "pdf")}
                      disabled={isDownloading}
                      className="flex-1 py-3 px-4 bg-foreground text-background rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 disabled:opacity-30 active:scale-[0.98]"
                    >
                      {isDownloading && downloading.format === "pdf" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileDown className="w-3.5 h-3.5" />
                      )}
                      PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
