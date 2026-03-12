"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(formData.email, formData.password);
      const userRole = data?.user?.user_metadata?.role || "student";
      router.push(
        userRole === "faculty" ? "/faculty-dashboard" : "/student-dashboard",
      );
    } catch (err) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-medium tracking-tight text-foreground">
            Sign In
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-foreground/80">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm text-foreground/80">Password</label>
            </div>
            <input
              type="password"
              required
              className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-foreground/40">
                Temporary Shortcuts
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() =>
                setFormData({ email: "name@example.com", password: "12345678" })
              }
              className="py-2 px-3 border border-border text-xs font-medium hover:bg-secondary transition-colors"
            >
              Student Login
            </button>
            <button
              onClick={() =>
                setFormData({ email: "fct@rit.com", password: "12345678" })
              }
              className="py-2 px-3 border border-border text-xs font-medium hover:bg-secondary transition-colors"
            >
              Faculty Login
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-foreground/60">
            Don't have an account?{" "}
            <Link href="/signup" className="text-foreground hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
