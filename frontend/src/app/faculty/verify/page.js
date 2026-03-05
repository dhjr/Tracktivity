"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// In a real app, this would be fetched from Supabase using `supabase.from('enrollments')...`
// For now, we mock some students to show the Verification UI working

export default function FacultyVerificationDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [verifyingId, setVerifyingId] = useState(null);

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (user?.user_metadata?.role !== "faculty") {
      router.push("/student-dashboard");
    } else {
      fetchStudents();
    }
  }, [user, router]);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/get-students");
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data.students || []);
    } catch (err) {
      console.error(err);
      // Fallback or show error
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (studentId) => {
    setVerifyingId(studentId);
    try {
      // NOTE: In the live app, studentId must be the actual Supabase Auth UUID
      // This will fail on the mock IDs above but the UI layout is ready.
      const res = await fetch("/api/verify-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, facultyId: user.id }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to verify.");
      }

      // Update local state instantly
      setStudents((current) =>
        current.map((s) =>
          s.id === studentId ? { ...s, isKtuVerified: true } : s,
        ),
      );
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8 border-b border-border pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">
            KTU ID Verification
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            Review and lock enrolled student KTU IDs
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-4">Enrolled Students</h2>
          <div className="border border-border bg-background rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-foreground/60 uppercase bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Student Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">KTU ID</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-foreground/70">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 font-mono text-foreground/80 uppercase">
                        {student.ktuId}
                      </td>
                      <td className="px-6 py-4">
                        {student.isKtuVerified ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-green-500/10 text-green-600 uppercase tracking-wider">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-yellow-500/10 text-yellow-600 uppercase tracking-wider">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleVerify(student.id)}
                          disabled={
                            student.isKtuVerified || verifyingId === student.id
                          }
                          className={`px-4 py-1.5 rounded text-xs font-medium transition-all ${
                            student.isKtuVerified
                              ? "bg-secondary text-foreground/40 cursor-not-allowed"
                              : "bg-foreground text-background hover:bg-foreground/90 active:scale-95"
                          }`}
                        >
                          {verifyingId === student.id
                            ? "Verifying..."
                            : student.isKtuVerified
                              ? "Locked"
                              : "Verify ID"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-foreground/50"
                      >
                        No students currently enrolled in your rooms.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
