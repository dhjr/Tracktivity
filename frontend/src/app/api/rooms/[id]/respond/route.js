import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const { studentId, status } = await request.json(); // status = 'approved' or 'rejected'
    const roomId = (await params).id;

    if (!studentId || !status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid request body" },
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Verify faculty actually created this room
    const { data: room, error: roomErr } = await supabase
      .from("rooms")
      .select("id")
      .eq("id", roomId)
      .eq("created_by", user.id)
      .single();

    if (roomErr || !room) {
      return NextResponse.json(
        { error: "Room not found or unauthorized to manage this room." },
        { status: 404 },
      );
    }

    // 3. Update the enrollment status
    const { error: updateErr } = await supabase
      .from("enrollments")
      .update({ status })
      .eq("room_id", roomId)
      .eq("student_id", studentId);

    if (updateErr) {
      console.error("Error updating enrollment status:", updateErr);
      return NextResponse.json(
        { error: "Failed to update enrollment status." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Unexpected error in rooms/[id]/respond route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
