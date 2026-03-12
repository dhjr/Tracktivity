"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const userRole = user?.user_metadata?.role || "student";
      router.push(
        userRole === "faculty" ? "/faculty-dashboard" : "/student-dashboard",
      );
    }
  }, [user, router]);

  // If user exists, we are redirecting, so optionally render nothing or a loader
  if (user) return null;

  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl md:text-5xl font-medium mb-4 text-foreground tracking-tight">
        Tracktivity.
      </h1>
      <p className="text-base text-foreground/60 mb-8 max-w-md">
        KTU Activity point dashboard for seamless activity point tracking.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/signup"
          className="px-6 py-2.5 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          Sign Up
        </Link>
        <Link
          href="/login"
          className="px-6 py-2.5 border border-border text-sm font-medium hover:bg-secondary transition-colors text-foreground"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
