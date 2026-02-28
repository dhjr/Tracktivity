import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.user_metadata?.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch enrollments and inner join with the rooms table
    // Supabase JS allows joining through foreign keys simply by specifying the related table
    const { data: enrollments, error: fetchErr } = await supabase
      .from("enrollments")
      .select(
        `
        status,
        enrolled_at,
        rooms (
          id,
          name,
          join_code
        )
      `,
      )
      .eq("student_id", user.id)
      .order("enrolled_at", { ascending: false });

    if (fetchErr) {
      console.error("Error fetching enrollments:", fetchErr);
      return NextResponse.json(
        { error: "Failed to fetch enrolled rooms" },
        { status: 500 },
      );
    }

    // Flatten data for easier UI consumption
    const rooms = enrollments.map((e) => ({
      ...e.rooms,
      status: e.status,
      enrolled_at: e.enrolled_at,
    }));

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Unexpected error in rooms/student route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
