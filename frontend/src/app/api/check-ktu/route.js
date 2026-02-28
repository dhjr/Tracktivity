import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { ktuId } = await request.json();

    if (!ktuId) {
      return NextResponse.json(
        { error: "KTU ID is required" },
        { status: 400 },
      );
    }

    // We must use the SERVICE_ROLE key here because the anon key cannot filter
    // or list users from the auth.users table for security reasons.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // List all users. Note: If your app scales to thousands of users,
    // this will require pagination (or better yet, a dedicated profiles table).
    // For MVP phase, checking the array in memory works.
    const {
      data: { users },
      error,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("Error fetching users for validation:", error);
      return NextResponse.json(
        { error: "Internal validation error" },
        { status: 500 },
      );
    }

    // Check if any user has this exact KTU ID in their metadata
    // And ensure they aren't marked as faculty
    const isDuplicate = users.some(
      (user) =>
        user.user_metadata?.role === "student" &&
        user.user_metadata?.ktuId?.toUpperCase() === ktuId.toUpperCase(),
    );

    return NextResponse.json({ isUnique: !isDuplicate });
  } catch (error) {
    console.error("Unexpected error in check-ktu route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
