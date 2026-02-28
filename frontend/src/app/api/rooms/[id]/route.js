import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    const roomId = (await params).id;
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

    // 3. Delete the room
    const { error: deleteErr } = await supabase
      .from("rooms")
      .delete()
      .eq("id", roomId);

    if (deleteErr) {
      console.error("Error deleting room:", deleteErr);
      return NextResponse.json(
        { error: "Failed to delete room." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in rooms/[id] DELETE route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
