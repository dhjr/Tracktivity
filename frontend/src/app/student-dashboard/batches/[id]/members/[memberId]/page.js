"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { getAuthHeaders } from "@/utils/api";
import { getInitials } from "@/utils/helpers";
import RoleBadge from "@/components/RoleBadge";
import PageLoader from "@/components/PageLoader";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ShieldCheck, ShieldAlert } from "lucide-react";

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 bg-background">
      <span className="text-xs font-semibold uppercase tracking-wider text-foreground/40">{label}</span>
      <span className="text-sm text-foreground/80 text-right">{value}</span>
    </div>
  );
}

export default function StudentMemberDetailPage({ params }) {
  const { user, isReady } = useRequireRole("student");
  const router = useRouter();
  const { id: batchId, memberId } = use(params);

  const [member, setMember] = useState(null);
  const [batchName, setBatchName] = useState("");
  const [loading, setLoading] = useState(true);

  const [memberRole, memberId_raw] = memberId.split(/-(.+)/);

  useEffect(() => {
    if (isReady) fetchMember();
  }, [isReady, batchId, memberId]);

  const fetchMember = async () => {
    setLoading(true);
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const [batchRes, membersRes] = await Promise.all([
        fetch(`${API_URL}/batches/${batchId}`, { headers }),
        fetch(`${API_URL}/batches/${batchId}/members`, { headers }),
      ]);
      if (batchRes.ok) setBatchName((await batchRes.json()).name);
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

  if (!user || loading) return <PageLoader />;

      <div className="min-h-[calc(100vh-6rem)] w-full flex flex-col items-center justify-center gap-4">
        <p className="text-foreground/50">Member not found.</p>
      </div>

  const isFaculty = member.role === "faculty";
  const name = isFaculty ? member.full_name : member.studentName;

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-xl mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center gap-3 py-10 border-b border-border mb-8">
        <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center text-2xl font-bold text-foreground/70">
          {getInitials(name)}
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">{name || "Unknown"}</h1>
          <div className="mt-2 flex items-center justify-center">
            <RoleBadge role={member.role} isAdmin={member.is_admin} />
          </div>
        </div>
      </div>
      <div className="space-y-0 divide-y divide-border border border-border overflow-hidden bg-background">
        {member.department && <DetailRow label="Department" value={member.department} />}
        {!isFaculty && member.ktuId && (
          <DetailRow label="KTU ID" value={
            <span className="flex items-center gap-2 font-mono">
              {member.ktuId}
              {member.isKtuVerified
                ? <ShieldCheck className="w-4 h-4 text-green-500" />
                : <ShieldAlert className="w-4 h-4 text-red-400" />}
            </span>
          } />
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
