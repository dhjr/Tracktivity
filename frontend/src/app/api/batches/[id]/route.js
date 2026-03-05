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

    // 2. Verify faculty actually created this batch
    const { data: batch, error: batchErr } = await supabase
      .from("batches")
      .select("id")
      .eq("id", roomId)
      .eq("created_by", user.id)
      .single();

    if (batchErr || !batch) {
      return NextResponse.json(
        { error: "Batch not found or unauthorized to manage this batch." },
        { status: 404 },
      );
    }

    // 3. Delete the batch
    const { error: deleteErr } = await supabase
      .from("batches")
      .delete()
      .eq("id", roomId);

    if (deleteErr) {
      console.error("Error deleting batch:", deleteErr);
      return NextResponse.json(
        { error: "Failed to delete batch." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in batches/[id] DELETE route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
