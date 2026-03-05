import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { joinCode } = await request.json();

    if (!joinCode || joinCode.trim() === "") {
      return NextResponse.json(
        { error: "Join code is required" },
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

    if (user.user_metadata?.role !== "student") {
      return NextResponse.json(
        { error: "Only students can join rooms" },
        { status: 403 },
      );
    }

    // 2. Find the room by join_code
    const { data: room, error: roomErr } = await supabase
      .from("rooms")
      .select("id")
      .eq("join_code", joinCode.toUpperCase().trim())
      .single();

    if (roomErr || !room) {
      return NextResponse.json(
        { error: "Invalid join code or room not found" },
        { status: 404 },
      );
    }

    // 3. Insert the enrollment
    const { error: enrollErr } = await supabase.from("enrollments").insert({
      room_id: room.id,
      student_id: user.id,
      status: "pending",
    });

    // If there's an error, check if it's the unique constraint (23505)
    if (enrollErr) {
      if (enrollErr.code === "23505") {
        return NextResponse.json(
          { error: "You are already enrolled in this room." },
          { status: 409 },
        );
      }
      console.error("Error inserting enrollment:", enrollErr);
      return NextResponse.json(
        { error: "Failed to join room. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, roomId: room.id });
  } catch (error) {
    console.error("Unexpected error in rooms/join route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
