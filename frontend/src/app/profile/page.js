"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Building,
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit3,
  X,
  Save,
  ChevronRight,
  ShieldCheck,
  Fingerprint,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import Select from "@/components/ui/Select";

export default function ProfilePage() {
  const { user, updateProfile, updatePassword } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    ktuId: "",
    department: "",
    studentCategory: "",
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (user) {
      setFormData({
        name: user.user_metadata?.name || "",
        email: user.email || "",
        ktuId: user.user_metadata?.ktuId || "",
        department: user.user_metadata?.department || "",
        studentCategory: user.user_metadata?.studentCategory || "regular",
      });
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isKtuVerified = user.user_metadata?.isKtuVerified === true;

      if (
        !isKtuVerified &&
        user.user_metadata?.role !== "faculty" &&
        formData.ktuId &&
        formData.ktuId !== user.user_metadata?.ktuId
      ) {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const checkRes = await fetch(`${API_URL}/auth/check-ktu`, {
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
        department: formData.department,
        studentCategory: formData.studentCategory,
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

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground/20">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const userRole = user.user_metadata?.role || "student";

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl mx-auto p-6 md:p-10">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-3xl bg-secondary/20 border border-border/50 flex items-center justify-center shadow-xl backdrop-blur-md overflow-hidden relative">
                <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <User className="w-10 h-10 text-foreground/60 transition-transform duration-500 group-hover:scale-110" />
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-widest text-primary">
                  {userRole}
                </div>
              </div>
              <h1 className="text-4xl font-display font-medium tracking-tight text-foreground lowercase">
                {user.user_metadata?.name || "Account User"}
              </h1>
            </div>
          </div>

          <button
            onClick={() => {
              if (isEditing) {
                setFormData({
                  name: user.user_metadata?.name || "",
                  email: user.email || "",
                  ktuId: user.user_metadata?.ktuId || "",
                  department: user.user_metadata?.department || "",
                  studentCategory:
                    user.user_metadata?.studentCategory || "regular",
                });
              }
              setIsEditing(!isEditing);
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              isEditing
                ? "bg-secondary/20 text-foreground/60 hover:bg-secondary/40 border border-border/50"
                : "bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10"
            }`}
          >
            {isEditing ? (
              <>
                <X className="w-3.5 h-3.5" /> Cancel Edit
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </>
            )}
          </button>
        </div>

        {/* Unified Profile & Security Card */}
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          <div className="p-8 md:p-12 bg-secondary/5 border border-border/50 backdrop-blur-xl rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 ml-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-5 py-3.5 bg-background/50 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border transition-all text-sm font-medium"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="space-y-2 group">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 ml-1">
                        Department
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-5 py-3.5 bg-background/50 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border transition-all text-sm font-medium"
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                        placeholder="e.g. Computer Science"
                      />
                    </div>

                    {userRole !== "faculty" && (
                      <div className="space-y-2 group">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 ml-1">
                          Student Category
                        </label>
                        <Select
                          value={formData.studentCategory}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              studentCategory: e.target.value,
                            })
                          }
                          options={[
                            { label: "Regular Student", value: "regular" },
                            { label: "Lateral Entry", value: "lateralEntry" },
                            { label: "PwD Student", value: "pwd" },
                          ]}
                        />
                      </div>
                    )}

                    {userRole !== "faculty" && (
                      <div className="space-y-2 group md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 ml-1 flex items-center justify-between">
                          KTU ID
                          {user.user_metadata?.isKtuVerified && (
                            <span className="text-[8px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full border border-green-500/20">
                              Verified & Locked
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          required
                          disabled={user.user_metadata?.isKtuVerified}
                          className={`w-full px-5 py-3.5 bg-background/50 border border-border/50 rounded-2xl focus:outline-none transition-all uppercase placeholder:normal-case text-sm font-mono tracking-widest ${
                            user.user_metadata?.isKtuVerified
                              ? "opacity-50 cursor-not-allowed grayscale"
                              : "focus:ring-2 focus:ring-primary/10 focus:border-border"
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
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-foreground text-background rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 transition-all active:scale-[0.98] shadow-xl shadow-foreground/10 flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Changes
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0 text-sm">
                  {[
                    {
                      label: "Full Name",
                      value: user.user_metadata?.name || "Not provided",
                    },
                    {
                      label: "Department",
                      value: user.user_metadata?.department || "Not provided",
                    },
                    ...(userRole !== "faculty"
                      ? [
                          {
                            label: "KTU ID",
                            value: user.user_metadata?.ktuId || "Not provided",
                            verified: user.user_metadata?.isKtuVerified,
                          },
                        ]
                      : []),
                    { label: "Email Address", value: user.email },
                    ...(userRole !== "faculty"
                      ? [
                          {
                            label: "Student Category",
                            value:
                              user.user_metadata?.studentCategory ===
                              "lateralEntry"
                                ? "Lateral Entry"
                                : user.user_metadata?.studentCategory === "pwd"
                                  ? "PwD Student"
                                  : "Regular Student",
                          },
                        ]
                      : []),
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between py-6 border-b border-border/30 group ${i === 3 || (userRole === "faculty" && i === 2) ? "border-b-0 md:border-b" : ""}`}
                    >
                      <div className="flex flex-col">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 mb-1">
                          {item.label}
                        </p>
                        <span
                          className={`text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors ${item.label === "KTU ID" ? "font-mono uppercase" : ""}`}
                        >
                          {item.value}
                        </span>
                      </div>
                      {item.verified !== undefined && (
                        <div
                          className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${item.verified ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"}`}
                        >
                          {item.verified ? "Verified" : "Unverified"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Unified Security Section */}
              <div className="mt-12 pt-12 border-t border-border/50">
                {!isChangingPassword && (
                  <div className="flex">
                    <button
                      onClick={() => {
                        setPasswordData({
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setPasswordMessage(null);
                        setShowPassword(false);
                        setIsChangingPassword(true);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors flex items-center gap-2 mb-8"
                    >
                      Modify Password
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {isChangingPassword && (
                  <form
                    onSubmit={handlePasswordSubmit}
                    className="space-y-6 animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto py-4"
                  >
                    {passwordMessage && (
                      <div
                        className={`p-4 text-[10px] font-bold rounded-2xl flex items-center gap-3 animate-in shake-1 ${
                          passwordMessage.type === "success"
                            ? "bg-green-500/10 text-green-600 border border-green-500/20"
                            : "bg-red-500/10 text-red-600 border border-red-500/20"
                        }`}
                      >
                        {passwordMessage.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        <span className="uppercase tracking-widest">
                          {passwordMessage.text}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-1 ml-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">
                            New Password
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-[9px] font-black uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors"
                          >
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          className="w-full px-5 py-3.5 bg-background/50 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border transition-all text-sm font-medium"
                          placeholder="••••••••"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 mb-1 ml-1 block mt-[3px]">
                          Confirm Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          className="w-full px-5 py-3.5 bg-background/50 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-border transition-all text-sm font-medium"
                          placeholder="••••••••"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsChangingPassword(false)}
                        className="flex-1 py-4 bg-secondary/10 hover:bg-secondary/20 border border-border/50 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-foreground transition-all"
                      >
                        Discard
                      </button>
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="flex-[2] py-4 bg-foreground text-background rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 transition-all active:scale-[0.98] shadow-xl shadow-foreground/10 flex items-center justify-center gap-2"
                      >
                        {passwordLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Update Credentials"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
