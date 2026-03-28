"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { User, Mail, Lock, BookOpen, GraduationCap, Briefcase, ArrowRight, ShieldCheck } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    ktuId: "",
    department: "",
    studentCategory: "regular",
    role: "student",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.department &&
    formData.password.length >= 6 &&
    (formData.role === "faculty" ||
      (formData.role === "student" && formData.ktuId.length >= 10));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (formData.role === "student") {
        const ktuRegex = /^[A-Z]{3,4}[0-9]{2}[A-Z]{2}[0-9]{3}$/;
        if (!ktuRegex.test(formData.ktuId)) {
          throw new Error("Invalid KTU ID format (e.g., KTE23CS043)");
        }
        
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const checkRes = await fetch(`${API_URL}/auth/check-ktu?ktuId=${formData.ktuId}`);
        const checkData = await checkRes.json();

        if (checkData.isPresent) {
          throw new Error("This KTU ID is already registered.");
        }
      }

      await signup(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.department,
        formData.ktuId,
        formData.studentCategory,
      );

      router.push(formData.role === "faculty" ? "/faculty-dashboard" : "/student-dashboard");
    } catch (err) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-block mb-4">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl mx-auto shadow-lg border border-border/50" />
          </Link>
          <h1 className="text-2xl font-display font-medium tracking-tight text-foreground">
            Join Tracktivity
          </h1>
          <p className="text-xs text-foreground/50 mt-1 font-light">Create your premium activity point dashboard</p>
        </div>

        <div className="bg-secondary/5 border border-border/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] rounded-lg flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-background/30 border border-border/30 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "student" })}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  formData.role === "student" ? "bg-foreground text-background shadow-lg" : "text-foreground/40 hover:text-foreground/60"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "faculty", ktuId: "", studentCategory: "" })}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  formData.role === "faculty" ? "bg-foreground text-background shadow-lg" : "text-foreground/40 hover:text-foreground/60"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Faculty
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-foreground">
                    <User className="h-4 w-4 text-foreground/20" />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border transition-all text-sm placeholder:text-foreground/20"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-foreground">
                    <Mail className="h-4 w-4 text-foreground/20" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border transition-all text-sm placeholder:text-foreground/20"
                    placeholder="name@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Department</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-foreground">
                    <BookOpen className="h-4 w-4 text-foreground/20" />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border transition-all text-sm placeholder:text-foreground/20"
                    placeholder="e.g. CS / EC"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>

              {formData.role === "student" ? (
                <div className="space-y-1.5" key="student-fields-ktu">
                  <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">KTU ID</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-foreground">
                      <ShieldCheck className="h-4 w-4 text-foreground/20" />
                    </div>
                    <input
                      key="ktuId-input"
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border transition-all text-sm uppercase placeholder:text-foreground/20"
                      placeholder="KTE23CS..."
                      value={formData.ktuId || ""}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                        if (val.length <= 11) setFormData({ ...formData, ktuId: val });
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5" key="faculty-fields-staff">
                  <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Staff Access Code</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-foreground">
                      <ShieldCheck className="h-4 w-4 text-foreground/20" />
                    </div>
                    <input
                      key="staff-code-input"
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border transition-all text-sm placeholder:text-foreground/20"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              )}


              {formData.role === "student" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Student Category</label>
                  <select
                    required
                    className="w-full px-4 py-2.5 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border transition-all text-sm appearance-none"
                    value={formData.studentCategory}
                    onChange={(e) => setFormData({ ...formData, studentCategory: e.target.value })}
                  >
                    <option value="regular">Regular Student</option>
                    <option value="lateralEntry">Lateral Entry</option>
                    <option value="pwd">PwD Student</option>
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-foreground">
                    <Lock className="h-4 w-4 text-foreground/20" />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border transition-all text-sm placeholder:text-foreground/20"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full py-3.5 bg-foreground text-background text-sm font-medium rounded-xl hover:bg-foreground/90 disabled:opacity-30 transition-all active:scale-[0.98] shadow-xl shadow-foreground/10 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-foreground/40 font-light">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground/80 font-medium hover:underline hover:text-foreground transition-all">
              Log In
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}

