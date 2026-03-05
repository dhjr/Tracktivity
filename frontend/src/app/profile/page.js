"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, updateProfile, updatePassword } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    ktuId: "",
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Initialize form data when user loads, redirect if not logged in
  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (user) {
      setFormData({
        name: user.user_metadata?.name || "",
        email: user.email || "",
        ktuId: user.user_metadata?.ktuId || "",
      });
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isKtuVerified = user.user_metadata?.isKtuVerified === true;

      // If already verified, we shouldn't attempt to check duplicates or update it
      if (
        !isKtuVerified &&
        user.user_metadata?.role !== "faculty" &&
        formData.ktuId &&
        formData.ktuId !== user.user_metadata?.ktuId
      ) {
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

      await updateProfile({
        name: formData.name,
        // Only submit the KTU ID if it hasn't been locked yet by a faculty member
        ...(isKtuVerified ? {} : { ktuId: formData.ktuId }),
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "Password must be at least 6 characters long.",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await updatePassword(passwordData.newPassword);
      setPasswordData({ newPassword: "", confirmPassword: "" });
      setPasswordMessage({
        type: "success",
        text: "Password updated successfully!",
      });
      // Optionally hide the form after a delay
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Failed to update password:", err);
      setPasswordMessage({
        type: "error",
        text: err.message || "Failed to update password.",
      });
    } finally {
      setPasswordLoading(false);
    }
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
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-xl mx-auto p-4 md:p-8">
      <div className="mb-8 border-b border-border pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground">
            {user.user_metadata?.name || user.email?.split("@")[0] || "Profile"}
          </h1>
          <p className="text-sm text-foreground/60 mt-1">{user.email}</p>
          <p className="text-xs text-foreground/40 mt-1 uppercase tracking-wider font-medium">
            Role: {user.user_metadata?.role || "student"}
          </p>
        </div>
        <button
          onClick={() => {
            if (isEditing) {
              setFormData({
                name: user.user_metadata?.name || "",
                email: user.email || "",
                ktuId: user.user_metadata?.ktuId || "",
              });
            }
            setIsEditing(!isEditing);
          }}
          className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-foreground/80">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          {user.user_metadata?.role !== "faculty" && (
            <div className="space-y-1.5 flex flex-col">
              <label className="text-sm text-foreground/80 flex items-center gap-2">
                KTU ID
                {user.user_metadata?.isKtuVerified && (
                  <span className="text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">
                    Verified & Locked
                  </span>
                )}
              </label>
              <input
                type="text"
                required
                disabled={user.user_metadata?.isKtuVerified}
                className={`w-full px-3 py-2 bg-background border border-border focus:outline-none transition-colors uppercase placeholder:normal-case ${
                  user.user_metadata?.isKtuVerified
                    ? "opacity-60 cursor-not-allowed bg-secondary/30"
                    : "focus:border-foreground"
                }`}
                value={formData.ktuId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ktuId: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm text-foreground/80">Email Address</label>
            <input
              type="email"
              disabled
              className="w-full px-3 py-2 bg-secondary/50 border border-border text-foreground/50 cursor-not-allowed"
              value={formData.email}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors mt-4"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      ) : (
        <div className="space-y-4 text-sm mt-8">
          <div className="flex flex-col space-y-1 border-b border-border pb-4">
            <span className="text-foreground/50">Full Name</span>
            <span className="text-foreground">
              {user.user_metadata?.name || "Not provided"}
            </span>
          </div>
          {user.user_metadata?.role !== "faculty" && (
            <div className="flex flex-col space-y-1 border-b border-border pb-4">
              <div className="flex items-center gap-2 text-foreground/50">
                <span>KTU ID</span>
                {user.user_metadata?.isKtuVerified ? (
                  <span className="text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">
                    Verified
                  </span>
                ) : (
                  <span className="text-[10px] bg-yellow-500/10 text-yellow-600 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">
                    Unverified
                  </span>
                )}
              </div>
              <span className="text-foreground uppercase">
                {user.user_metadata?.ktuId || "Not provided"}
              </span>
            </div>
          )}
          <div className="flex flex-col space-y-1 border-b border-border pb-4">
            <span className="text-foreground/50">Email Address</span>
            <span className="text-foreground">{user.email}</span>
          </div>
          <div className="flex flex-col space-y-1 border-b border-border pb-4">
            <span className="text-foreground/50">Account Type</span>
            <span className="text-foreground capitalize">
              {user.user_metadata?.role || "student"}
            </span>
          </div>
        </div>
      )}

      {/* Security Section */}
      <div className="mt-12 border-t border-border pt-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-medium tracking-tight text-foreground">
              Security
            </h2>
            <p className="text-sm text-foreground/60 mt-1">
              Manage your password and security settings.
            </p>
          </div>
          <button
            onClick={() => {
              setPasswordData({ newPassword: "", confirmPassword: "" });
              setPasswordMessage(null);
              setShowPassword(false);
              setIsChangingPassword(!isChangingPassword);
            }}
            className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
          >
            {isChangingPassword ? "Cancel" : "Change Password"}
          </button>
        </div>

        {isChangingPassword && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordMessage && (
              <div
                className={`p-3 text-sm rounded-md ${
                  passwordMessage.type === "success"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                }`}
              >
                {passwordMessage.text}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm text-foreground/80 flex items-center justify-between">
                <span>New Password</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-foreground/50 hover:text-foreground transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/30"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-foreground/80">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/30"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2.5 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors mt-4 flex items-center justify-center"
            >
              {passwordLoading ? (
                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
