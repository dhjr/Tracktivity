"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowLeft,
  Loader2,
  Crown,
  GraduationCap,
  BookUser,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 bg-background">
      <span className="text-xs font-semibold uppercase tracking-wider text-foreground/40">{label}</span>
      <span className="text-sm text-foreground/80 text-right">{value}</span>
    </div>
  );
}

export default function StudentMemberDetailPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const { id: batchId, memberId } = use(params);

  const [member, setMember] = useState(null);
  const [batchName, setBatchName] = useState("");
  const [loading, setLoading] = useState(true);

  const [memberRole, memberId_raw] = memberId.split(/-(.+)/);

  useEffect(() => {
    if (user === null) router.push("/login");
    else if (
      user?.user_metadata?.role !== "student" &&
      user?.user_metadata?.role !== undefined
    ) router.push("/faculty-dashboard");
    else fetchMember();
  }, [user, router, batchId, memberId]);

  const fetchMember = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const headers = { Authorization: `Bearer ${session?.access_token}` };

      const [batchRes, membersRes] = await Promise.all([
        fetch(`${API_URL}/batches/${batchId}`, { headers }),
        fetch(`${API_URL}/batches/${batchId}/members`, { headers }),
      ]);

      if (batchRes.ok) {
        const b = await batchRes.json();
        setBatchName(b.name);
      }

      if (membersRes.ok) {
        const data = await membersRes.json();
        if (memberRole === "faculty") {
          const f = (data.faculty || []).find((x) => x.id === memberId_raw);
          if (f) setMember({ ...f, role: "faculty" });
        } else {
          const s = (data.students || []).find((x) => x.student_id === memberId_raw);
          if (s) setMember({ ...s, role: "student" });
        }
      }
    } catch (err) {
      console.error("Error fetching member:", err);
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

  if (!member) {
    return (
      <div className="min-h-[calc(100vh-6rem)] w-full flex flex-col items-center justify-center gap-4">
        <p className="text-foreground/50">Member not found.</p>
        <Link href={`/student-dashboard/batches/${batchId}/members`} className="text-sm underline text-foreground/60">
          Back to Members
        </Link>
      </div>
    );
  }

  const isFaculty = member.role === "faculty";
  const name = isFaculty ? member.full_name : member.studentName;
  const department = member.department;

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-xl mx-auto p-4 md:p-8">
      <Link
        href={`/student-dashboard/batches/${batchId}/members`}
        className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Members
      </Link>

      {/* Avatar card */}
      <div className="flex flex-col items-center gap-3 py-10 border-b border-border mb-8">
        <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center text-2xl font-bold text-foreground/70">
          {getInitials(name)}
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">{name || "Unknown"}</h1>
          <div className="mt-2 flex items-center justify-center gap-2">
            {isFaculty ? (
              member.is_admin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Crown className="w-3.5 h-3.5" /> Batch Admin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  <BookUser className="w-3.5 h-3.5" /> Faculty
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-foreground/10 text-foreground/60">
                <GraduationCap className="w-3.5 h-3.5" /> Student
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-0 divide-y divide-border border border-border overflow-hidden bg-background">
        {department && <DetailRow label="Department" value={department} />}
        {!isFaculty && member.ktuId && (
          <DetailRow
            label="KTU ID"
            value={
              <span className="flex items-center gap-2 font-mono">
                {member.ktuId}
                {member.isKtuVerified ? (
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                )}
              </span>
            }
          />
        )}
        {!isFaculty && member.studentType && (
          <DetailRow label="Student Type" value={<span className="capitalize">{member.studentType}</span>} />
        )}
        <DetailRow label="Batch" value={batchName} />
        <DetailRow label="Role" value={isFaculty ? (member.is_admin ? "Admin Faculty" : "Faculty") : "Student"} />
      </div>
    </div>
  );
}
