"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { BookOpen, Calendar, Activity, Loader2, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState("");
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
      fetchEnrolledRooms();
    }
  }, [user, router]);

  const fetchEnrolledRooms = async () => {
    try {
      const res = await fetch("/api/rooms/student");
      if (!res.ok) throw new Error("Failed to fetch rooms");
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (err) {
      console.error("Fetch enrolled rooms error:", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setIsJoining(true);
    setJoinError("");
    setJoinSuccess(false);

    try {
      const res = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join room");

      setJoinSuccess(true);
      setJoinCode("");

      // Refresh the rooms list to show the newly joined room
      await fetchEnrolledRooms();

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Placeholder for Activity */}
        <div className="block p-6 bg-secondary/20 border border-border border-dashed rounded-xl opacity-70">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
            <Activity className="w-5 h-5 text-foreground/60" />
          </div>
          <h3 className="font-medium text-foreground mb-1">Recent Activity</h3>
          <p className="text-sm text-foreground/60">
            Track your latest activity and submissions.
          </p>
        </div>

        {/* Placeholder for Calendar */}
        <div className="block p-6 bg-secondary/20 border border-border border-dashed rounded-xl opacity-70">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
            <Calendar className="w-5 h-5 text-foreground/60" />
          </div>
          <h3 className="font-medium text-foreground mb-1">Schedule</h3>
          <p className="text-sm text-foreground/60">
            View upcoming deadlines and events.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Enrolled Rooms
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Join Room Form Card */}
          <div className="p-6 bg-secondary/10 border border-border rounded-xl">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <KeyRound className="w-4 h-4" /> Join a Room
            </h3>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              {joinError && <p className="text-xs text-red-500">{joinError}</p>}
              {joinSuccess && (
                <p className="text-xs text-green-500">
                  Join request sent! Waiting for faculty approval.
                </p>
              )}
              <input
                type="text"
                placeholder="6-Digit Join Code"
                className="w-full px-3 py-2 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors uppercase placeholder:normal-case font-mono"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                required
                maxLength={6}
              />
              <button
                type="submit"
                disabled={isJoining || joinCode.length < 5}
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

          {/* List of Joined Rooms */}
          {loadingRooms ? (
            <div className="md:col-span-2 flex items-center justify-center border border-border border-dashed rounded-xl p-8">
              <Loader2 className="w-6 h-6 animate-spin text-foreground/30" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="md:col-span-2 flex flex-col items-center justify-center border border-border border-dashed rounded-xl p-8 text-center bg-secondary/10">
              <span className="text-foreground/40 mb-2">
                You aren't enrolled in any rooms.
              </span>
              <span className="text-sm text-foreground/60">
                Ask your professor for a Join Code and enter it here.
              </span>
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className="p-6 bg-background border border-border rounded-xl flex flex-col justify-between hover:shadow-sm transition-all group relative"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {room.status === "pending" ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                      Pending Approval
                    </span>
                  ) : room.status === "rejected" ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
                      Rejected
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                      Approved
                    </span>
                  )}
                </div>

                <div>
                  <h3
                    className="font-medium text-lg leading-tight truncate pr-24"
                    title={room.name}
                  >
                    {room.name}
                  </h3>
                  <div className="mt-3 text-xs text-foreground/50">
                    Requested: {new Date(room.enrolled_at).toLocaleDateString()}
                  </div>
                </div>

                {room.status === "approved" ? (
                  <Link
                    href={`/student-dashboard/rooms/${room.id}`}
                    className="mt-6 text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors inline-block"
                  >
                    Enter Room &rarr;
                  </Link>
                ) : (
                  <div className="mt-6 text-sm font-medium text-foreground/30 cursor-not-allowed">
                    {room.status === "rejected"
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
