"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signup(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
      );
      // Depending on Supabase settings, email confirmation might be required.
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center p-4 bg-background transition-colors duration-300">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-background rounded-2xl p-6 md:p-8 border border-border shadow-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-primary-foreground">
                T
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Join Tractivity
            </h1>
            <p className="text-sm text-foreground/60 mt-1">
              Start your journey today
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 ml-1">
                Full Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all duration-200"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 ml-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all duration-200"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 ml-1">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "student" })}
                  className={`py-2 rounded-lg border font-medium transition-all duration-200 ${
                    formData.role === "student"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-input text-foreground hover:bg-secondary"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "faculty" })}
                  className={`py-2 rounded-lg border font-medium transition-all duration-200 ${
                    formData.role === "faculty"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-input text-foreground hover:bg-secondary"
                  }`}
                >
                  Faculty
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 ml-1">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all duration-200"
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
              className="w-full py-2.5 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-foreground/60">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
