"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { BookOpen, Calendar, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (
      user?.user_metadata?.role !== "student" &&
      user?.user_metadata?.role !== undefined
    ) {
      // Role is not student, might be faculty
      router.push("/faculty-dashboard");
    }
  }, [user, router]);

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder for Current Rooms */}
        <div className="block p-6 bg-secondary/20 border border-border border-dashed rounded-xl opacity-70">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
            <BookOpen className="w-5 h-5 text-foreground/60" />
          </div>
          <h3 className="font-medium text-foreground mb-1">Enrolled Rooms</h3>
          <p className="text-sm text-foreground/60">
            View the rooms you are currently participating in. (Coming Soon)
          </p>
        </div>

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
    </div>
  );
}
