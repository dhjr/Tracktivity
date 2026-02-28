import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Helper function to generate a random 6-character alphanumeric string
function generateJoinCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request) {
  try {
    const { name } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // 1. Get current authenticated user
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.user_metadata?.role !== "faculty") {
      return NextResponse.json(
        { error: "Forbidden. Only faculty can create rooms." },
        { status: 403 },
      );
    }

    // 2. Generate join code and insert into database
    // Note: in high volume systems, you'd want to handle the tiny chance of a UNIQUE
    // constraint collision on the join_code generation, but 6 chars (Base36) is plenty for MVP.
    const joinCode = generateJoinCode();

    const { data: room, error: insertErr } = await supabase
      .from("rooms")
      .insert({
        name,
        join_code: joinCode,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Error inserting room:", insertErr);
      return NextResponse.json(
        { error: "Failed to create room. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, room });
  } catch (error) {
    console.error("Unexpected error in rooms/create route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
