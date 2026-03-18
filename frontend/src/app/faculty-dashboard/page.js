"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { getAuthHeaders } from "@/utils/api";
import Link from "next/link";
import { Users, Plus, Loader2, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import BatchCodeBadge from "@/components/BatchCodeBadge";
import JoinBatch from "@/components/JoinBatch";

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
      if (!res.ok) throw new Error(data.detail || data.error || "Failed to create batch");
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
      if (!res.ok) throw new Error(data.detail || data.error || "Failed to join batch");
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

  if (!user) return null; // Wait for redirect or auth

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8 border-b border-border pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">
            Faculty Dashboard
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            Welcome back, {user?.user_metadata?.name || "Professor"}
          </p>
        </div>
      </div>


      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium flex items-center gap-2">
            <Users className="w-6 h-6" />
            My Batches
          </h2>
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
          {/* Create Batch Form Card */}
          <div className="p-6 bg-secondary/10 border border-border rounded-xl">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create New Batch
            </h3>
            <form onSubmit={handleCreateBatch} className="space-y-4">
              {createError && (
                <p className="text-xs text-red-500">{createError}</p>
              )}
              <input
                type="text"
                placeholder="Ex: CS 101 - Fall 24"
                className="w-full px-3 py-2 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors"
                value={newBatchName}
                onChange={(e) => setNewBatchName(e.target.value)}
                required
                maxLength={50}
              />
              <button
                type="submit"
                disabled={isCreating || !newBatchName.trim()}
                className="w-full py-2 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors flex justify-center items-center"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Create Batch"
                )}
              </button>
            </form>
          </div>

          {/* Join Batch Form Card */}
          <JoinBatch
            batchCode={batchCode}
            setBatchCode={setBatchCode}
            isJoining={isJoining}
            joinError={joinError}
            joinSuccess={joinSuccess}
            handleJoinBatch={handleJoinBatch}
          />

          {loadingBatches ? (
            <div className="md:col-span-3 flex items-center justify-center border border-border border-dashed rounded-xl p-8">
              <Loader2 className="w-6 h-6 animate-spin text-foreground/30" />
            </div>
          ) : batches.length === 0 ? (
            <div className="md:col-span-3 flex flex-col items-center justify-center border border-border border-dashed rounded-xl p-8 text-center bg-secondary/10">
              <span className="text-foreground/40 mb-2">
                No batches found.
              </span>
              <span className="text-sm text-foreground/60">
                Create a new batch or join an existing one.
              </span>
            </div>
          ) : (
            batches.map((batch) => (
              <div
                key={batch.id}
                className="p-6 bg-background border border-border rounded-xl flex flex-col justify-between hover:shadow-sm transition-all group"
              >
                <div>
                  <h3
                    className="font-medium text-lg leading-tight truncate"
                    title={batch.name}
                  >
                    {batch.name}
                  </h3>
                  <div className="mt-3">
                    <BatchCodeBadge code={batch.batch_code} size="sm" />
                  </div>
                  {batch.is_admin && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        Creator
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/faculty-dashboard/batches/${batch.id}`}
                  className="mt-6 text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors inline-block"
                >
                  Manage Batch &rarr;
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
