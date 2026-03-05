import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const batchId = (await params).id;
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

    // Verify faculty owns this batch
    const { data: batch, error: batchErr } = await supabase
      .from("batches")
      .select("id, name, batch_code")
      .eq("id", batchId)
      .eq("created_by", user.id)
      .single();

    if (batchErr || !batch) {
      return NextResponse.json(
        { error: "Batch not found or unauthorized" },
        { status: 404 },
      );
    }

    // Fetch students belonging to this batch
    const { data: students, error: studentErr } = await supabase
      .from("students")
      .select("id, full_name, ktuid, department, student_type")
      .eq("batch_id", batchId);

    if (studentErr) {
      console.error("Error fetching students:", studentErr);
      return NextResponse.json(
        { error: "Failed to fetch students" },
        { status: 500 },
      );
    }

    // Map fields so the frontend can display them easily matching the previous schema
    const formattedStudents = students.map((student) => ({
      student_id: student.id,
      studentName: student.full_name || "Unknown",
      studentEmail: "N/A", // Not stored in students table by default unless joined with profiles
      ktuId: student.ktuid || "N/A",
      department: student.department || "N/A",
      studentType: student.student_type || "N/A",
      isKtuVerified: false, // You can adapt this later if verification exists
    }));

    return NextResponse.json({ batch, students: formattedStudents });
  } catch (error) {
    console.error("Unexpected error in batches/[id]/students route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
