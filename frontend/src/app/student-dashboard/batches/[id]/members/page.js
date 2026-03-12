"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Loader2, Users } from "lucide-react";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function RoleBadge({ role, isAdmin }) {
  if (role === "faculty" && isAdmin) {
    return (
      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
        Admin
      </span>
    );
  }
  if (role === "faculty") {
    return (
      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-blue-500/15 text-blue-600 dark:text-blue-400">
        Faculty
      </span>
    );
  }
  return (
    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-foreground/10 text-foreground/50">
      Student
    </span>
  );
}

export default function StudentBatchMembersPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const { id: batchId } = use(params);

  const [batch, setBatch] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (
      user?.user_metadata?.role !== "student" &&
      user?.user_metadata?.role !== undefined
    ) {
      router.push("/faculty-dashboard");
    } else {
      fetchMembers();
    }
  }, [user, router, batchId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const headers = { Authorization: `Bearer ${session?.access_token}` };

      const [batchRes, membersRes] = await Promise.all([
        fetch(`${API_URL}/batches/${batchId}`, { headers }),
        fetch(`${API_URL}/batches/${batchId}/members`, { headers }),
      ]);

      if (batchRes.ok) setBatch(await batchRes.json());

      if (membersRes.ok) {
        const data = await membersRes.json();
        const facultyList = (data.faculty || []).map((f) => ({
          id: f.id,
          name: f.full_name,
          subtitle: f.department || "Faculty",
          role: "faculty",
          isAdmin: f.is_admin,
        }));
        const studentList = (data.students || []).map((s) => ({
          id: s.student_id,
          name: s.studentName,
          subtitle: s.department || s.studentType || "Student",
          role: "student",
          isAdmin: false,
        }));
        setMembers([
          ...facultyList.sort((a, b) => a.name?.localeCompare(b.name)),
          ...studentList.sort((a, b) => a.name?.localeCompare(b.name)),
        ]);
      }
    } catch (err) {
      console.error("Error fetching members:", err);
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
          href={`/student-dashboard/batches/${batchId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Batch
        </Link>
      </div>

      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          {batch?.name} – Members
        </h1>
        <p className="text-sm text-foreground/60 flex items-center gap-1 mt-2">
          <Users className="w-4 h-4" /> {members.length} member{members.length !== 1 && "s"}
        </p>
      </div>

      <div className="w-full pb-12">
        {members.length === 0 ? (
          <div className="p-12 border border-border border-dashed bg-secondary/5 flex items-center justify-center">
            <span className="text-foreground/30 text-xs font-medium uppercase tracking-widest">
              No members yet
            </span>
          </div>
        ) : (
          <div className="border border-border overflow-hidden bg-background divide-y divide-border">
            {members.map((member) => (
              <button
                key={`${member.role}-${member.id}`}
                onClick={() =>
                  router.push(
                    `/student-dashboard/batches/${batchId}/members/${member.role}-${member.id}`
                  )
                }
                className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/5 transition-colors text-left group"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center shrink-0 text-sm font-bold text-foreground/60 group-hover:text-foreground transition-colors">
                  {getInitials(member.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground/90 truncate">
                      {member.name || "Unknown"}
                    </span>
                    <RoleBadge role={member.role} isAdmin={member.isAdmin} />
                  </div>
                  <p className="text-xs text-foreground/40 truncate">{member.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
