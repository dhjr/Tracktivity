"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { Users, FileCheck, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function FacultyDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (user?.user_metadata?.role !== "faculty") {
      router.push("/student-dashboard");
    }
  }, [user, router]);

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Verification Card */}
        <Link
          href="/faculty/verify"
          className="group block p-6 bg-background border border-border rounded-xl hover:border-foreground/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <FileCheck className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-medium text-foreground mb-1">
            KTU ID Verification
          </h3>
          <p className="text-sm text-foreground/60">
            Review and lock KTU IDs of students enrolled in your rooms.
          </p>
        </Link>

        {/* Placeholder for Rooms */}
        <div className="block p-6 bg-secondary/20 border border-border border-dashed rounded-xl opacity-70">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-foreground/60" />
          </div>
          <h3 className="font-medium text-foreground mb-1">My Rooms</h3>
          <p className="text-sm text-foreground/60">
            Create and manage classroom rooms. (Coming Soon)
          </p>
        </div>

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
    </div>
  );
}
