"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);

  // Initialize form data when user loads, redirect if not logged in
  useEffect(() => {
    if (user === null) {
      // Redirect if definitely not logged in (user is null and we've mounted)
      const cached = localStorage.getItem("user");
      if (!cached) {
        router.push("/login");
      }
    } else if (user) {
      setFormData({ name: user.name || "", email: user.email || "" });
    }
  }, [user, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate save request
    setTimeout(() => {
      login({ ...user, ...formData });
      setIsEditing(false);
      setLoading(false);
    }, 1000);
  };

  // Prevent flash of empty state while auth loads
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-2xl mx-auto p-4 md:p-8 transition-colors duration-300">
      <div className="bg-background rounded-2xl p-6 md:p-8 border border-border shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            <span className="text-4xl font-bold text-primary">
              {user.name ? user.name.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
          <div className="flex flex-col items-center md:items-start flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {user.name}
            </h1>
            <p className="text-foreground/60 mt-1">{user.email}</p>
          </div>
          <div className="flex">
            <button
              onClick={() => {
                if (isEditing) {
                  // Reset form if canceling
                  setFormData({ name: user.name, email: user.email });
                }
                setIsEditing(!isEditing);
              }}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {isEditing ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 ml-1">
                Full Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all duration-200"
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
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all duration-200 text-foreground/60 cursor-not-allowed"
                value={formData.email}
                disabled // Usually email can't be easily changed
              />
            </div>
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-2.5 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300 border-t border-border pt-6">
            <div>
              <h3 className="text-sm font-medium text-foreground/60 mb-2">
                Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-foreground/5">
                  <p className="text-xs text-foreground/60 mb-1">Full Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-foreground/5">
                  <p className="text-xs text-foreground/60 mb-1">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
