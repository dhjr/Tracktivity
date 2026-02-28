import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
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

    // List all users from the auth system
    const {
      data: { users },
      error,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch students." },
        { status: 500 },
      );
    }

    // Filter to only students and map to a safe object layout for the UI
    const students = users
      .filter((user) => user.user_metadata?.role === "student")
      .map((user) => ({
        id: user.id,
        name: user.user_metadata?.name || "Unknown",
        email: user.email,
        ktuId: user.user_metadata?.ktuId || "N/A",
        isKtuVerified: user.user_metadata?.isKtuVerified === true,
      }));

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Unexpected error in get-students route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
