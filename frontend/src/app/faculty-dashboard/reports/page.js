"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { getAuthHeaders } from "@/utils/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Download, Users, BarChart3, List, Loader2 } from "lucide-react";

export default function ReportsPage() {
  const { user, isReady } = useRequireRole("faculty");
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [downloading, setDownloading] = useState({ type: "", format: "" });

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
      const res = await fetch(
        `${API_URL}/faculty/batches/${selectedBatch}/reports/${reportType}?format=${format}`,
        { headers }
      );
      
      if (!res.ok) throw new Error("Failed to download report");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
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
      description: "Overview of all students with their total points across all groups",
      icon: Users,
    },
    {
      id: "category-breakdown",
      title: "Category-wise Point Breakdown",
      description: "Detailed breakdown of points earned by each student per activity category",
      icon: BarChart3,
    },
    {
      id: "activity-breakdown",
      title: "Activity-wise Point Breakdown",
      description: "Comprehensive view of all approved activities with points awarded",
      icon: List,
    },
  ];

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          Reports
        </h1>
        <p className="text-sm text-foreground/60 mt-1">
          Generate and download batch reports in CSV or PDF format
        </p>
      </div>

      {/* Batch Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          Select Batch
        </label>
        {loadingBatches ? (
          <div className="flex items-center gap-2 text-sm text-foreground/60">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading batches...
          </div>
        ) : batches.length === 0 ? (
          <div className="text-sm text-foreground/60">
            No batches available. Create or join a batch first.
          </div>
        ) : (
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full md:w-96 px-3 py-2 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors"
          >
            <option value="">Choose a batch...</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name} ({batch.batch_code})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Reports Section */}
      {!selectedBatch ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-secondary/10 rounded-full mb-4">
            <FileText className="w-8 h-8 text-foreground/40" />
          </div>
          <h2 className="text-xl font-medium text-foreground mb-2">
            Choose a batch to continue
          </h2>
          <p className="text-sm text-foreground/60 max-w-md">
            Select a batch from the dropdown above to generate and download reports for that batch.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const Icon = report.icon;
            const isDownloading = downloading.type === report.id;
            
            return (
              <div
                key={report.id}
                className="p-6 bg-background border border-border rounded-xl hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-secondary/50 rounded-lg">
                    <Icon className="w-5 h-5 text-foreground/70" />
                  </div>
                  <h3 className="font-medium text-foreground">{report.title}</h3>
                </div>
                
                <p className="text-sm text-foreground/60 mb-6">
                  {report.description}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => downloadReport(report.id, "csv")}
                    disabled={isDownloading}
                    className="flex-1 py-2 px-3 text-xs font-medium text-foreground bg-secondary/50 hover:bg-secondary border border-border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    {isDownloading && downloading.format === "csv" ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                    CSV
                  </button>
                  <button
                    onClick={() => downloadReport(report.id, "pdf")}
                    disabled={isDownloading}
                    className="flex-1 py-2 px-3 text-xs font-medium text-foreground bg-secondary/50 hover:bg-secondary border border-border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    {isDownloading && downloading.format === "pdf" ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <FileText className="w-3 h-3" />
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
  );
}
