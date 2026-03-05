import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
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

    // 1. Get the current student record and their batch_id
    const { data: studentRecord, error: studentError } = await supabase
      .from("students")
      .select("batch_id")
      .eq("id", user.id)
      .single();

    if (studentError || !studentRecord) {
      return NextResponse.json({ batches: [] });
    }

    if (!studentRecord.batch_id) {
      return NextResponse.json({ batches: [] });
    }

    // 2. Fetch the batch details
    const { data: batch, error: batchError } = await supabase
      .from("batches")
      .select("id, name, batch_code, created_at, created_by")
      .eq("id", studentRecord.batch_id)
      .single();

    if (batchError || !batch) {
      return NextResponse.json({ batches: [] });
    }

    // Provide an array formatted consistently for the existing UI mapping logic
    const batches = [
      {
        ...batch,
        enrolled_at: batch.created_at, // Mocking enrolled_at for now since there's no actual timestamp stored
        status: "approved", // Since they are directly added to the batch, status is always approved
      },
    ];

    return NextResponse.json({ batches });
  } catch (error) {
    console.error("Unexpected error in batches/student route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
