import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match only the relevant paths:
     * - student-dashboard
     * - faculty-dashboard
     * - profile
     * - login
     * - signup
     */
    "/student-dashboard/:path*",
    "/faculty-dashboard/:path*",
    "/profile/:path*",
    "/login",
    "/signup",
  ],
};
