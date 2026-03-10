"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowLeft,
  Loader2,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export default function StudentSubmissionsPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const { id: batchId, studentId } = use(params);

  const [studentInfo, setStudentInfo] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (user?.user_metadata?.role !== "faculty") {
      router.push("/student-dashboard");
    } else {
      // In a real implementation, we would fetch the specific student's certs
      // For now, just set some dummy data and stop loading
      setStudentInfo({
        name: "Student Name",
        ktuId: "KTU123456",
        email: "student@example.com",
      });

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
      setLoading(false);
    }
  }, [user, router, batchId, studentId]);

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
          href={`/faculty-dashboard/batches/${batchId}/submissions`}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </Link>
      </div>

      <div className="mb-8 border-b border-border pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">
            {studentInfo?.name}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm text-foreground/60 font-mono">
              {studentInfo?.ktuId}
            </p>
            <span className="text-foreground/30">•</span>
            <p className="text-sm text-foreground/60">{studentInfo?.email}</p>
            <span className="text-foreground/30">•</span>
            <p className="text-sm font-medium text-foreground/80">
              Total Points: <span className="text-green-500">15</span>
            </p>
          </div>
        </div>
      </div>

      <div className="w-full pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Submitted Certificates</h2>
        </div>

        {certificates.length === 0 ? (
          <div className="p-12 border border-border border-dashed rounded-none bg-secondary/5 flex items-center justify-center">
            <span className="text-foreground/30 text-xs font-medium uppercase tracking-widest">
              No certificates submitted yet
            </span>
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

                  <button className="text-xs font-bold uppercase tracking-wider text-foreground/50 hover:text-foreground transition-colors px-3 py-1.5 border border-border hover:bg-secondary/10">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
