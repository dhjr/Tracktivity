"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ROLE_REDIRECTS = {
  faculty: "/student-dashboard",
  student: "/faculty-dashboard",
};

/**
 * Redirects unauthenticated users to /login and wrong-role users
 * to the appropriate dashboard. Returns the user object and an
 * `isReady` flag that is true only when the role matches.
 *
 * @param {"faculty"|"student"} role
 * @returns {{ user: object|null|undefined, isReady: boolean }}
 */
export function useRequireRole(role) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (
      user?.user_metadata?.role !== undefined &&
      user?.user_metadata?.role !== role
    ) {
      router.push(ROLE_REDIRECTS[role] ?? "/");
    }
  }, [user, router, role]);

  const isReady =
    user != null && user?.user_metadata?.role === role;

  return { user, isReady };
}
