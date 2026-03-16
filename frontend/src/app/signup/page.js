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
    studentCategory: "regular",
    role: "student",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if all required fields are filled to enable the button
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

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const checkRes = await fetch(
          `${API_URL}/auth/check-ktu?ktuId=${formData.ktuId}`,
        );
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
    <div className="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-sm">
        <div className="mb-4 text-center">
          <h1 className="text-xl font-medium tracking-tight text-foreground">
            Create Account
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-foreground/70">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-1.5 bg-background border border-border focus:outline-none focus:border-foreground text-sm transition-colors"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-foreground/70">Email</label>
              <input
                type="email"
                required
                className="w-full px-3 py-1.5 bg-background border border-border focus:outline-none focus:border-foreground text-sm transition-colors"
                placeholder="name@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-foreground/70">Department</label>
              <input
                type="text"
                required
                className="w-full px-3 py-1.5 bg-background border border-border focus:outline-none focus:border-foreground text-sm transition-colors"
                placeholder="CS / EC"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-foreground/70">Account Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    role: "student",
                    studentCategory: "regular",
                  })
                }
                className={`py-1.5 border text-xs transition-colors ${
                  formData.role === "student"
                    ? "bg-foreground text-background"
                    : "bg-background text-foreground"
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
                className={`py-1.5 border text-xs transition-colors ${
                  formData.role === "faculty"
                    ? "bg-foreground text-background"
                    : "bg-background text-foreground"
                }`}
              >
                Faculty
              </button>
            </div>
          </div>

          {formData.role === "student" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-foreground/70">Category</label>
                <select
                  required
                  className="w-full px-3 py-1.5 bg-background border border-border focus:outline-none focus:border-foreground text-sm appearance-none"
                  value={formData.studentCategory}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      studentCategory: e.target.value,
                    })
                  }
                >
                  <option value="regular">Regular</option>
                  <option value="lateralEntry">Lateral</option>
                  <option value="pwd">PwD</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-foreground/70">KTU ID</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-1.5 bg-background border border-border focus:outline-none focus:border-foreground text-sm uppercase"
                  placeholder="KTE23CS..."
                  value={formData.ktuId}
                  onChange={(e) => {
                    const val = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "");
                    if (val.length <= 11)
                      setFormData({ ...formData, ktuId: val });
                  }}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-foreground/70">Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-1.5 bg-background border border-border focus:outline-none focus:border-foreground text-sm transition-colors"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <div className="pt-2">
            {error && (
              <p className="text-[11px] text-red-500 mb-2 font-medium bg-red-500/5 p-2 border border-red-500/10">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-2 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-30 transition-all"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-foreground/60">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
