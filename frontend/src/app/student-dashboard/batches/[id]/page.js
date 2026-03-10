"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowLeft,
  Loader2,
  PlusCircle,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

export default function StudentBatchDetailPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const { id: batchId } = use(params);

  const [batch, setBatch] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dummy variables for now until we link real endpoints
  const totalPoints = 15;

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (
      user?.user_metadata?.role !== "student" &&
      user?.user_metadata?.role !== undefined
    ) {
      router.push("/faculty-dashboard");
    } else {
      fetchBatchDetails();
    }
  }, [user, router, batchId]);

  const fetchBatchDetails = async () => {
    setLoading(true);
    try {
      // In a real implementation we would fetch the specific batch details for the student
      // as well as their submitted certificates.

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${API_URL}/student/my-batches`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch batches");
      }

      const data = await res.json();
      const currentBatch = data.batches?.find((b) => b.id === batchId);

      if (!currentBatch) {
        router.push("/student-dashboard");
        return;
      }

      setBatch(currentBatch);

      // Dummy data for certificates
      setCertificates([
        {
          id: "1",
          name: "NSS Camp Participation",
          category: "Social Service",
          points: 10,
          status: "pending",
          submittedAt: "2024-03-10T10:00:00Z",
        },
        {
          id: "2",
          name: "Inter-college Hackathon",
          category: "Technical Events",
          points: 15,
          status: "approved",
          submittedAt: "2024-02-15T14:30:00Z",
        },
      ]);
    } catch (err) {
      console.error("Error fetching batch details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/student-dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <Link
          href={`/student-dashboard/batches/${batchId}/add-certificate`}
          className="inline-flex items-center gap-2 text-sm font-medium bg-foreground text-background px-4 py-2 flex items-center justify-center hover:bg-foreground/90 transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Add Certificate
        </Link>
      </div>

      <div className="mb-8 border-b border-border pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">
            {batch?.name}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm font-medium text-foreground/80">
              Total Points:{" "}
              <span className="text-green-500">{totalPoints}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="w-full pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">My Submissions</h2>
        </div>

        {certificates.length === 0 ? (
          <div className="p-12 border border-border border-dashed rounded-none bg-secondary/5 flex items-center justify-center flex-col gap-4">
            <span className="text-foreground/30 text-xs font-medium uppercase tracking-widest">
              You haven't submitted any certificates yet
            </span>
            <Link
              href={`/student-dashboard/batches/${batchId}/add-certificate`}
              className="text-xs font-bold uppercase tracking-wider text-foreground hover:text-foreground/80 transition-colors px-4 py-2 border border-border bg-secondary/10 hover:bg-secondary/20"
            >
              Add First Certificate
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-4 border border-border bg-background hover:bg-secondary/5 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary/10 shrink-0 text-foreground/50">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{cert.name}</h3>
                    <p className="text-xs text-foreground/50 mt-1">
                      {cert.category} • {cert.points} Points • Submitted{" "}
                      {new Date(cert.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    {cert.status === "approved" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    )}
                    {cert.status === "pending" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                    {cert.status === "rejected" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
