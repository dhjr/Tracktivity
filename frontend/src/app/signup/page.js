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
    ktuId: "",
    department: "",
    studentCategory: "Regular Students",
    role: "student",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Step 1: Enforce KTU ID Uniqueness for students
      if (formData.role === "student" && formData.ktuId) {
        const checkRes = await fetch("/api/check-ktu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ktuId: formData.ktuId }),
        });

        const checkData = await checkRes.json();

        if (checkRes.ok && !checkData.isUnique) {
          throw new Error("A student with this KTU ID is already registered.");
        }
      }

      // Step 2: Proceed with Signup
      await signup(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.department,
        formData.ktuId,
        formData.studentCategory,
      );
      // Depending on Supabase settings, email confirmation might be required.
      router.push(
        formData.role === "faculty"
          ? "/faculty-dashboard"
          : "/student-dashboard",
      );
    } catch (err) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-medium tracking-tight text-foreground">
            Create Account
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-foreground/80">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

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
            <label className="text-sm text-foreground/80">Department</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors"
              placeholder="e.g. Computer Science"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-foreground/80">Account Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    role: "student",
                    studentCategory: "Regular Students",
                  })
                }
                className={`py-2 border text-sm transition-colors ${
                  formData.role === "student"
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background border-border text-foreground hover:bg-secondary"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    role: "faculty",
                    ktuId: "",
                    studentCategory: "",
                  })
                }
                className={`py-2 border text-sm transition-colors ${
                  formData.role === "faculty"
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background border-border text-foreground hover:bg-secondary"
                }`}
              >
                Faculty
              </button>
            </div>
          </div>

          {formData.role === "student" && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm text-foreground/80">
                  Student Category
                </label>
                <select
                  required
                  className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors appearance-none"
                  value={formData.studentCategory}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      studentCategory: e.target.value,
                    })
                  }
                >
                  <option value="Regular Students">Regular Students</option>
                  <option value="Lateral Entry">Lateral Entry</option>
                  <option value="PwD Students">PwD Students</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-foreground/80">KTU ID</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors uppercase placeholder:normal-case"
                  placeholder="e.g. KTE23CS043"
                  value={formData.ktuId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ktuId: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-sm text-foreground/80">Password</label>
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
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-foreground/60">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
