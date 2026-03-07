"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { Users, FileCheck, Settings, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function FacultyDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newBatchName, setNewBatchName] = useState("");
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (user?.user_metadata?.role !== "faculty") {
      router.push("/student-dashboard");
    } else {
      fetchBatches();
    }
  }, [user, router]);

  const fetchBatches = async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${API_URL}/faculty/my-batches`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
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
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${API_URL}/batches/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ name: newBatchName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create batch");

      // Add the new batch to the top of the list locally
      setBatches([data.batch, ...batches]);
      setNewBatchName(""); // clear input
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setIsCreating(false);
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Verification Card - will eventually be embedded contextually inside Rooms, but good for global access too */}
        <Link
          href="/faculty/verify"
          className="group block p-6 bg-background border border-border rounded-xl hover:border-foreground/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <FileCheck className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-medium text-foreground mb-1">
            Global Verification
          </h3>
          <p className="text-sm text-foreground/60">
            Review and lock KTU IDs of all students enrolled in your batches.
          </p>
        </Link>

        {/* Placeholder for Settings */}
        <div className="block p-6 bg-secondary/20 border border-border border-dashed rounded-xl opacity-70">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
            <Settings className="w-5 h-5 text-foreground/60" />
          </div>
          <h3 className="font-medium text-foreground mb-1">Settings</h3>
          <p className="text-sm text-foreground/60">
            Configure your faculty preferences.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium flex items-center gap-2">
            <Users className="w-6 h-6" />
            My Batches
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Room Form Card */}
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

          {loadingBatches ? (
            <div className="md:col-span-2 flex items-center justify-center border border-border border-dashed rounded-xl p-8">
              <Loader2 className="w-6 h-6 animate-spin text-foreground/30" />
            </div>
          ) : batches.length === 0 ? (
            <div className="md:col-span-2 flex flex-col items-center justify-center border border-border border-dashed rounded-xl p-8 text-center bg-secondary/10">
              <span className="text-foreground/40 mb-2">
                No batches created yet.
              </span>
              <span className="text-sm text-foreground/60">
                Create your first batch by filling out the form.
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
                  <div className="mt-3 flex items-center justify-between bg-secondary/30 px-3 py-2 rounded">
                    <span className="text-xs text-foreground/60 font-medium">
                      BATCH CODE:
                    </span>
                    <span className="text-sm font-mono tracking-widest font-bold">
                      {batch.batch_code}
                    </span>
                  </div>
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
