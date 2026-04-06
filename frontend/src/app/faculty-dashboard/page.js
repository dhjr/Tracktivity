"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { getAuthHeaders } from "@/utils/api";
import Link from "next/link";
import { Users, Plus, Loader2, FileText, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import BatchCodeBadge from "@/components/BatchCodeBadge";
import JoinBatch from "@/components/JoinBatch";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";

export default function FacultyDashboardPage() {
  const { user, isReady } = useRequireRole("faculty");

  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newBatchName, setNewBatchName] = useState("");
  const [createError, setCreateError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [batchCode, setBatchCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);

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

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError("");
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const res = await fetch(`${API_URL}/batches/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ name: newBatchName }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.detail || data.error || "Failed to create batch");
      setBatches([data.batch, ...batches]);
      setNewBatchName("");
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setIsCreating(false);
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
      if (!res.ok)
        throw new Error(data.detail || data.error || "Failed to join batch");
      setJoinSuccess(true);
      setBatchCode("");
      await fetchBatches();
      setTimeout(() => setJoinSuccess(false), 3000);
    } catch (err) {
      setJoinError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  if (!user || (loadingBatches && batches.length === 0)) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full relative  bg-background">
      {/* Decorative Background Elements - Hidden on mobile for performance */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[80px] pointer-events-none hidden md:block" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[80px] pointer-events-none hidden md:block" />

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10">
        <DashboardHeader
          name={user?.user_metadata?.name || "Professor"}
          badge="Faculty"
        />

        <div className="space-y-6">
          <div className="flex items-center justify-end">
            {batches.length > 0 && (
              <Link
                href="/faculty-dashboard/reports"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-secondary/50 hover:bg-secondary border border-border rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                View Reports
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Create Batch Card */}
            <div className="p-8 bg-secondary/5 border border-border/50 backdrop-blur-none md:backdrop-blur-xl rounded-3xl relative overflow-hidden group hover:border-border transition-all duration-500 flex flex-col justify-between h-full min-h-[250px]">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-background rounded-lg border border-border/50 shadow-sm">
                    <Plus className="w-4 h-4 text-foreground/75" />
                  </div>
                  <h3 className="font-display font-bold text-lg leading-tight tracking-tight">
                    Create Batch
                  </h3>
                </div>

                <p className="text-xs text-foreground/60 font-light mb-6 leading-relaxed">
                  Initialize a new tracking group for your students. Each batch
                  will have a unique code for enrollment.
                </p>

                <form
                  onSubmit={handleCreateBatch}
                  className="space-y-4 mt-auto"
                >
                  {createError && (
                    <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] rounded-lg animate-in fade-in duration-300">
                      {createError}
                    </div>
                  )}

                  <div className="relative group/input">
                    <input
                      type="text"
                      placeholder="Ex. CS 101 - Fall 24"
                      className="w-full px-4 py-3 text-sm bg-background/50 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border transition-all placeholder:normal-case font-medium text-center"
                      value={newBatchName}
                      onChange={(e) => setNewBatchName(e.target.value)}
                      required
                      maxLength={50}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCreating || !newBatchName.trim()}
                    className="w-full py-3.5 bg-foreground text-background text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-foreground/90 disabled:opacity-30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Initialize"
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Join Batch Form Card */}
            <JoinBatch
              batchCode={batchCode}
              setBatchCode={setBatchCode}
              isJoining={isJoining}
              joinError={joinError}
              joinSuccess={joinSuccess}
              handleJoinBatch={handleJoinBatch}
              className="backdrop-blur-none md:backdrop-blur-xl"
            />

            {batches.length === 0 && !loadingBatches ? (
              <div className="md:col-span-3 flex flex-col items-center justify-center border border-border/50 border-dashed rounded-[2.5rem] p-12 text-center bg-secondary/5 backdrop-blur-sm">
                <span className="text-foreground/20 mb-2 font-display text-lg">
                  No active batches found
                </span>
                <span className="text-xs text-foreground/40 font-light">
                  Get started by creating a new tracking group above.
                </span>
              </div>
            ) : (
              batches.map((batch) => (
                <div
                  key={batch.id}
                  className="p-8 bg-secondary/5 border border-border/50 backdrop-blur-none md:backdrop-blur-xl rounded-3xl flex flex-col justify-between hover:border-border transition-all duration-500 group relative overflow-hidden h-full min-h-[250px]"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3
                        className="font-display font-bold text-lg leading-tight truncate group-hover:text-foreground transition-colors"
                        title={batch.name}
                      >
                        {batch.name}
                      </h3>
                      {batch.is_admin && (
                        <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                          Primary
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <BatchCodeBadge code={batch.batch_code} size="sm" />
                    </div>
                  </div>

                  <div className="mt-auto pt-8">
                    <Link
                      href={`/faculty-dashboard/batches/${batch.id}`}
                      className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 group-hover:text-foreground transition-all flex items-center gap-2"
                    >
                      Manage Group
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>

                  {/* Subtle background detail */}
                  <Users className="absolute -bottom-4 -right-4 w-24 h-24 text-foreground/2 transform -rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
