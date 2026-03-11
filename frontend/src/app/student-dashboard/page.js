"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { BookOpen, Loader2, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [batchCode, setBatchCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (
      user?.user_metadata?.role !== "student" &&
      user?.user_metadata?.role !== undefined
    ) {
      router.push("/faculty-dashboard");
    } else {
      fetchEnrolledBatches();
    }
  }, [user, router]);

  const fetchEnrolledBatches = async () => {
    try {
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
        setBatches([]);
        return;
      }
      const data = await res.json();
      setBatches(data.batches || []);
    } catch (err) {
      console.error("Fetch enrolled batches error:", err);
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
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${API_URL}/batches/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ batch_code: batchCode }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.detail || data.error || "Failed to join batch");

      setJoinSuccess(true);
      setBatchCode("");

      // Refresh the batches list to show the newly joined batch
      await fetchEnrolledBatches();

      // Clear success message after 3 seconds
      setTimeout(() => setJoinSuccess(false), 3000);
    } catch (err) {
      setJoinError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  if (!user) return null; // Wait for redirect

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8 border-b border-border pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">
            Student Dashboard
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            Welcome back, {user?.user_metadata?.name || "Student"}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            My Batch
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Join Batch Form Card */}
          <div className="p-6 bg-secondary/10 border border-border rounded-xl">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <KeyRound className="w-4 h-4" /> Join a Batch
            </h3>
            <form onSubmit={handleJoinBatch} className="space-y-4">
              {joinError && <p className="text-xs text-red-500">{joinError}</p>}
              {joinSuccess && (
                <p className="text-xs text-green-500">
                  Successfully joined the batch!
                </p>
              )}
              <input
                type="text"
                placeholder="Ex. CS101A"
                className="w-full px-3 py-2 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors uppercase placeholder:normal-case font-mono"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value.toUpperCase())}
                required
              />
              <button
                type="submit"
                disabled={isJoining || !batchCode.trim()}
                className="w-full py-2 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors flex justify-center items-center"
              >
                {isJoining ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Join"
                )}
              </button>
            </form>
          </div>

          {/* List of Joined Batches */}
          {loadingBatches ? (
            <div className="md:col-span-2 flex items-center justify-center border border-border border-dashed rounded-xl p-8">
              <Loader2 className="w-6 h-6 animate-spin text-foreground/30" />
            </div>
          ) : batches.length === 0 ? (
            <div className="md:col-span-2 flex flex-col items-center justify-center border border-border border-dashed rounded-xl p-8 text-center bg-secondary/10">
              <span className="text-foreground/40 mb-2">
                You aren't enrolled in a batch yet.
              </span>
              <span className="text-sm text-foreground/60">
                Ask your faculty for a Batch Code and enter it here.
              </span>
            </div>
          ) : (
            batches.map((batch) => (
              <div
                key={batch.id}
                className="p-6 bg-background border border-border rounded-xl flex flex-col justify-between hover:shadow-sm transition-all group relative"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {batch.status === "pending" ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                      Pending Approval
                    </span>
                  ) : batch.status === "rejected" ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
                      Rejected
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                      Joined
                    </span>
                  )}
                </div>

                <div>
                  <h3
                    className="font-medium text-lg leading-tight truncate pr-24"
                    title={batch.name}
                  >
                    {batch.name}
                  </h3>
                  <div className="mt-3 text-xs text-foreground/50">
                    Joined: {new Date(batch.enrolled_at).toLocaleDateString()}
                  </div>
                </div>

                {batch.status === "approved" ? (
                  <Link
                    href={`/student-dashboard/batches/${batch.id}`}
                    className="mt-6 text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors inline-block"
                  >
                    View Batch &rarr;
                  </Link>
                ) : (
                  <div className="mt-6 text-sm font-medium text-foreground/30 cursor-not-allowed">
                    {batch.status === "rejected"
                      ? "Access Denied"
                      : "Waiting for Access..."}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
