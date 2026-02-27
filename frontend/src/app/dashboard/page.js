"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import FacultyDashboard from "@/components/dashboard/FacultyDashboard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null && !loading) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Route to the correct dashboard based on role
  if (user.role === "faculty") {
    return <FacultyDashboard />;
  }

  // Placeholder for Student Dashboard
  return (
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-7xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>
      <p className="text-foreground/60 mt-2">
        Welcome to your dashboard, {user.name}!
      </p>
      {/* TODO: Implement Student Dashboard */}
    </div>
  );
}
