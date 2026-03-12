import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/student") ||
    request.nextUrl.pathname.startsWith("/faculty") ||
    request.nextUrl.pathname.startsWith("/profile") ||
    request.nextUrl.pathname.startsWith("/admin");

  if (!user && isProtectedRoute) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect based on user role
  const userRole = user?.user_metadata?.role || "student";

  if (user && isAuthRoute) {
    // user is logged in, redirect away from auth pages
    const url = request.nextUrl.clone();
    url.pathname =
      userRole === "faculty" ? "/faculty-dashboard" : "/student-dashboard";
    return NextResponse.redirect(url);
  }

  // Prevent students from accessing faculty dashboard
  if (
    user &&
    request.nextUrl.pathname.startsWith("/faculty") &&
    userRole !== "faculty"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/student-dashboard";
    return NextResponse.redirect(url);
  }

  // Prevent faculty from accessing student dashboard
  if (
    user &&
    request.nextUrl.pathname.startsWith("/student") &&
    userRole === "faculty"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/faculty-dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
