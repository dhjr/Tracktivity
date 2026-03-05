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
      router.push(userRole === "faculty" ? "/faculty" : "/student");
    }
  }, [user, router]);

  // If user exists, we are redirecting, so optionally render nothing or a loader
  if (user) return null;

  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl md:text-5xl font-medium mb-4 text-foreground tracking-tight">
        Tractivity.
      </h1>
      <p className="text-base text-foreground/60 mb-8 max-w-md">
        A minimal activity tracker to build habits, track progress, and stay
        productive.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/signup"
          className="px-6 py-2.5 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="px-6 py-2.5 border border-border text-sm font-medium hover:bg-secondary transition-colors text-foreground"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
