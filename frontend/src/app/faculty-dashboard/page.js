"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { Users, FileCheck, Settings, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function FacultyDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (user?.user_metadata?.role !== "faculty") {
      router.push("/student-dashboard");
    } else {
      fetchRooms();
    }
  }, [user, router]);

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/rooms/faculty");
      if (!res.ok) throw new Error("Failed to fetch rooms");
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError("");

    try {
      const res = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoomName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create room");

      // Add the new room to the top of the list locally
      setRooms([data.room, ...rooms]);
      setNewRoomName(""); // clear input
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
            Review and lock KTU IDs of all students enrolled in your rooms.
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
            My Rooms
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Room Form Card */}
          <div className="p-6 bg-secondary/10 border border-border rounded-xl">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create New Room
            </h3>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              {createError && (
                <p className="text-xs text-red-500">{createError}</p>
              )}
              <input
                type="text"
                placeholder="Ex: CS 101 - Fall 24"
                className="w-full px-3 py-2 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                required
                maxLength={50}
              />
              <button
                type="submit"
                disabled={isCreating || !newRoomName.trim()}
                className="w-full py-2 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors flex justify-center items-center"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Create Room"
                )}
              </button>
            </form>
          </div>

          {/* List of Existing Rooms */}
          {loadingRooms ? (
            <div className="md:col-span-2 flex items-center justify-center border border-border border-dashed rounded-xl p-8">
              <Loader2 className="w-6 h-6 animate-spin text-foreground/30" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="md:col-span-2 flex flex-col items-center justify-center border border-border border-dashed rounded-xl p-8 text-center bg-secondary/10">
              <span className="text-foreground/40 mb-2">
                No rooms created yet.
              </span>
              <span className="text-sm text-foreground/60">
                Create your first room by filling out the form.
              </span>
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className="p-6 bg-background border border-border rounded-xl flex flex-col justify-between hover:shadow-sm transition-all group"
              >
                <div>
                  <h3
                    className="font-medium text-lg leading-tight truncate"
                    title={room.name}
                  >
                    {room.name}
                  </h3>
                  <div className="mt-3 flex items-center justify-between bg-secondary/30 px-3 py-2 rounded">
                    <span className="text-xs text-foreground/60 font-medium">
                      JOIN CODE:
                    </span>
                    <span className="text-sm font-mono tracking-widest font-bold">
                      {room.join_code}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/faculty-dashboard/rooms/${room.id}`}
                  className="mt-6 text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors inline-block"
                >
                  Manage Room &rarr;
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
