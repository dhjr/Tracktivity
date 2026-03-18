"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { getAuthHeaders } from "@/utils/api";
import { BookOpen, Loader2, Award, FileText, ArrowRight, Plus, ExternalLink, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import JoinBatch from "@/components/JoinBatch";

export default function StudentDashboardPage() {
  const { user, isReady } = useRequireRole("student");

  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [batchCode, setBatchCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [stats, setStats] = useState({
    total_approved_points: 0,
    pending_count: 0,
  });

  useEffect(() => {
    if (isReady) fetchDashboardData();
  }, [isReady]);

  const fetchDashboardData = async () => {
    setLoadingBatches(true);
    try {
      const { headers, API_URL } = await getAuthHeaders();

      const [batchRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/student/my-batches`, { headers }),
        fetch(`${API_URL}/student/dashboard?view=summary`, { headers }),
      ]);

      if (batchRes.ok) {
        const data = await batchRes.json();
        setBatches(data.batches || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats({
          total_approved_points: data.total_approved_points || 0,
          pending_count: data.pending_count || 0,
        });
      }
    } catch (err) {
      console.error("Fetch dashboard data error:", err);
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleJoinBatch = async (e) => {
    e.preventDefault();
    setIsJoining(true);
    setJoinError("");
    setJoinSuccess(false);

    try {
      const { headers, API_URL } = await getAuthHeaders();
      const res = await fetch(`${API_URL}/batches/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ batch_code: batchCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Failed to join batch");
      setJoinSuccess(true);
      setBatchCode("");
      await fetchDashboardData();
      setTimeout(() => setJoinSuccess(false), 3000);
    } catch (err) {
      setJoinError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  if (!user) return null; // Wait for redirect

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                  <Activity className="w-5 h-5 text-background" />
               </div>
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60">Student Portal</span>
            </div>
            <h1 className="text-4xl font-display font-medium tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-sm text-foreground/70 mt-1 font-light italic">
              Welcome back, <span className="text-foreground/90 font-normal not-italic">{user?.user_metadata?.name || "Student"}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-secondary/10 border border-border/50 rounded-xl backdrop-blur-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 block">Current Status</span>
                <span className="text-xs font-medium text-foreground/80">Academic Year 2023-24</span>
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          {/* Points Card */}
          <div className="lg:col-span-2 p-8 bg-secondary/5 border border-border/50 backdrop-blur-xl rounded-3xl group hover:border-border transition-all duration-500 shadow-2xl">
            <div className="relative z-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/60 mb-3 flex items-center gap-2">
                <Award className="w-3 h-3" />
                Total Activity Points
              </p>
              <div className="flex items-baseline gap-3">
                <p className="text-6xl font-display font-bold text-foreground tracking-tighter">
                  {stats.total_approved_points}
                </p>
                <p className="text-lg text-foreground/50 font-light">
                  / 100 Approved
                </p>
              </div>
              
              <div className="mt-8">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-xs font-medium text-foreground/60 uppercase tracking-widest">Progress to Milestone</span>
                  <span className="text-xs font-bold text-foreground">{Math.min(stats.total_approved_points, 100)}%</span>
                </div>
                <div className="w-full bg-background/50 h-3 rounded-full overflow-hidden border border-border/20 p-0.5 backdrop-blur-sm">
                  <div
                    className="bg-linear-to-r from-foreground/80 to-foreground h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.1)]"
                    style={{
                      width: `${Math.min(stats.total_approved_points, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pending Card */}
           <div className="p-8 bg-secondary/5 border border-border/50 backdrop-blur-xl rounded-3xl group hover:border-border transition-all duration-500 shadow-2xl flex flex-col justify-between">
            <div className="relative z-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/60 mb-3 flex items-center gap-2">
                <FileText className="w-3 h-3" />
                Pending Review
              </p>
              <p className="text-5xl font-display font-bold text-foreground tracking-tighter">
                {stats.pending_count}
              </p>
              <p className="mt-2 text-xs text-foreground/60 font-light pr-8 leading-relaxed">
                Currently awaiting verification by your department faculty.
              </p>
            </div>
            <div className="relative z-10 pt-6">
               <button className="w-full py-3 bg-secondary/10 border border-border/30 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-foreground/80 hover:bg-secondary/20 hover:text-foreground transition-all flex items-center justify-center gap-2">
                  View Details
                  <ArrowRight className="w-3 h-3" />
               </button>
            </div>
          </div>
        </div>

        {/* Categories / Sections */}
        <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center shadow-sm">
                  <BookOpen className="w-5 h-5 text-foreground/60" />
                </div>
                <h2 className="text-2xl font-display font-medium tracking-tight">
                  Enrolled Batches
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Join Batch Form Card */}
              {!loadingBatches && batches.length === 0 && (
                <JoinBatch
                  batchCode={batchCode}
                  setBatchCode={setBatchCode}
                  isJoining={isJoining}
                  joinError={joinError}
                  joinSuccess={joinSuccess}
                  handleJoinBatch={handleJoinBatch}
                />
              )}

              {/* List of Joined Batches */}
              {loadingBatches ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-48 bg-secondary/5 border border-border/50 rounded-3xl animate-pulse" />
                ))
              ) : batches.length === 0 ? (
                <div className={`${!loadingBatches && batches.length === 0 ? 'md:col-span-1 lg:col-span-2' : 'md:col-span-3'} flex flex-col items-center justify-center min-h-[200px] bg-secondary/5 border border-border/30 border-dashed rounded-3xl px-8 text-center backdrop-blur-sm group hover:border-border/60 transition-colors`}>
                  <div className="w-12 h-12 bg-background rounded-full border border-border/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-foreground/20" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground/60 mb-1">No Active Enrollments</h3>
                  <p className="text-xs text-foreground/30 font-light max-w-[200px]"> Enrolling in a batch allows you to submit points to specific faculty.</p>
                </div>
              ) : (
                batches.map((batch) => (
                  <div
                    key={batch.id}
                    className="p-6 bg-secondary/5 border border-border/50 backdrop-blur-xl rounded-3xl flex flex-col justify-between hover:shadow-2xl hover:border-border transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-foreground/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-background rounded-xl border border-border/50 shadow-sm group-hover:scale-110 transition-transform duration-500">
                          <BookOpen className="w-4 h-4 text-foreground/60" />
                        </div>
                        {batch.status === "pending" ? (
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                            Pending
                          </span>
                        ) : batch.status === "rejected" ? (
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20">
                            Rejected
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20">
                            Active
                          </span>
                        )}
                      </div>

                      <h3
                        className="font-display font-bold text-lg leading-tight tracking-tight text-foreground/90 group-hover:text-foreground transition-colors"
                        title={batch.name}
                      >
                        {batch.name}
                      </h3>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-foreground/30">
                        Joined {new Date(batch.enrolled_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="mt-8 relative z-10">
                      {batch.status === "approved" ? (
                        <Link
                          href={`/student-dashboard/batches/${batch.id}`}
                          className="flex items-center justify-center gap-2 w-full py-2.5 bg-foreground text-background text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-foreground/90 active:scale-[0.98] transition-all"
                        >
                          View Batch
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <div className="w-full py-2.5 bg-secondary/20 border border-border/30 rounded-xl text-[10px] font-bold uppercase tracking-widest text-foreground/30 text-center cursor-not-allowed">
                          {batch.status === "rejected"
                            ? "Access Denied"
                            : "Awaiting Access"}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-20 py-10 border-t border-border/20 text-center relative z-10">
        <p className="text-[10px] text-foreground/20 uppercase tracking-[0.5em] font-medium pointer-events-none">
          Powered by Tracktivity
        </p>
      </div>
    </div>
  );
}
