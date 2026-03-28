"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { getAuthHeaders } from "@/utils/api";
import { getInitials } from "@/utils/helpers";
import RoleBadge from "@/components/RoleBadge";
import PageLoader from "@/components/PageLoader";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Users } from "lucide-react";

export default function StudentBatchMembersPage({ params }) {
  const { user, isReady } = useRequireRole("student");
  const router = useRouter();
  const { id: batchId } = use(params);

  const [batch, setBatch] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady) fetchMembers();
  }, [isReady, batchId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { headers, API_URL } = await getAuthHeaders();
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
          subtitle: s.studentType
            ? `${s.studentType} Student`
            : s.department || "Student",
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

  if (!user || loading) return <PageLoader />;

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10">
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground leading-tight flex items-baseline gap-4">
            {batch?.name}
            <span className="text-xl md:text-2xl font-normal text-foreground/30">
              Total: {members.length}
            </span>
          </h1>
        </div>

        <div className="w-full pb-20">
          {members.length === 0 ? (
            <div className="p-20 border border-border/30 border-dashed rounded-[2.5rem] bg-secondary/5 backdrop-blur-sm flex flex-col items-center justify-center text-center animate-in fade-in duration-1000">
              <div className="w-16 h-16 rounded-full bg-background border border-border/50 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-foreground/20" />
              </div>
              <span className="text-sm font-display font-medium text-foreground/40 uppercase tracking-widest">
                No members found
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              {members.map((member, index) => (
                <div
                  key={`${member.role}-${member.id}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="w-full relative group"
                >
                  <div className="relative flex items-center gap-4 p-4 rounded-3xl bg-background/40 border border-border/50 backdrop-blur-md transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-secondary/30 border border-border/50 flex items-center justify-center shrink-0 text-base font-bold text-foreground/40 transition-all duration-500 overflow-hidden relative">
                      <span className="relative z-10">
                        {getInitials(member.name)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display font-bold text-lg text-foreground/90 truncate">
                            {member.name || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] text-foreground/40 font-medium truncate uppercase tracking-wider">
                            {member.subtitle}
                          </p>
                          <div className="h-1 w-1 rounded-full bg-border" />
                          <RoleBadge
                            role={member.role}
                            isAdmin={member.isAdmin}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
