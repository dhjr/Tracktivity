"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { ArrowRight, Mail, Lock, GraduationCap, Briefcase } from "lucide-react";

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-4 text-center">
          <Link href="/" className="inline-block mb-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-10 h-10 rounded-xl mx-auto shadow-lg border border-border/50"
            />
          </Link>
          <h1 className="text-2xl font-display font-medium tracking-tight text-foreground">
            Welcome Back
          </h1>
          <p className="text-xs text-foreground/50 mt-1 font-light">
            Enter your credentials to access your dashboard
          </p>
        </div>

        <div className="bg-secondary/5 border border-border/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[12px] rounded-lg flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-foreground/60 ml-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-foreground">
                  <Mail className="h-4 w-4 text-foreground/30" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border transition-all text-sm placeholder:text-foreground/20"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-medium text-foreground/60 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-foreground">
                  <Lock className="h-4 w-4 text-foreground/30" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border transition-all text-sm placeholder:text-foreground/20"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-foreground text-background text-sm font-medium rounded-xl hover:bg-foreground/90 disabled:opacity-50 transition-all active:scale-[0.98] mt-1 shadow-xl shadow-foreground/10 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Select Buttons - Redesigned */}
          <div className="mt-6 pt-6 border-t border-border/30">
            <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/30 text-center mb-4">
              Quick test Accounts
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    email: "name@example.com",
                    password: "12345678",
                  })
                }
                className="group flex flex-col items-center gap-2 p-3 border border-border/30 rounded-xl hover:bg-secondary/50 hover:border-border transition-all active:scale-95"
              >
                <div className="w-8 h-8 bg-background rounded-full border border-border/50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <GraduationCap className="w-4 h-4 text-foreground/60" />
                </div>
                <span className="text-[10px] font-medium text-foreground/70">
                  Student Portal
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ email: "fct@rit.com", password: "12345678" })
                }
                className="group flex flex-col items-center gap-2 p-3 border border-border/30 rounded-xl hover:bg-secondary/50 hover:border-border transition-all active:scale-95"
              >
                <div className="w-8 h-8 bg-background rounded-full border border-border/50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <Briefcase className="w-4 h-4 text-foreground/60" />
                </div>
                <span className="text-[10px] font-medium text-foreground/70">
                  Faculty Portal
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-foreground/40 font-light">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-foreground/80 font-medium hover:underline hover:text-foreground transition-all"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
