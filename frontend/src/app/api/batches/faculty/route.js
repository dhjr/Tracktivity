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

    if (user.user_metadata?.role !== "faculty") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all batches created by this user, ordered newest first
    const { data: batches, error: fetchErr } = await supabase
      .from("batches")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (fetchErr) {
      console.error("Error fetching batches:", fetchErr);
      return NextResponse.json(
        { error: "Failed to fetch batches" },
        { status: 500 },
      );
    }

    return NextResponse.json({ batches });
  } catch (error) {
    console.error("Unexpected error in batches/faculty route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
