import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { studentId, facultyId } = await request.json();

    if (!studentId || !facultyId) {
      return NextResponse.json(
        { error: "Student ID and Faculty ID are required" },
        { status: 400 },
      );
    }

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

    // 1. Verify the requester is actually Faculty
    const { data: facultyReq, error: facultyErr } =
      await supabaseAdmin.auth.admin.getUserById(facultyId);

    if (facultyErr || facultyReq.user?.user_metadata?.role !== "faculty") {
      return NextResponse.json(
        { error: "Unauthorized. Only faculty can verify KTU IDs." },
        { status: 403 },
      );
    }

    // 2. Fetch the student to ensure they exist and get their current metadata
    const { data: studentReq, error: studentErr } =
      await supabaseAdmin.auth.admin.getUserById(studentId);

    if (studentErr || !studentReq.user) {
      return NextResponse.json(
        { error: "Student not found." },
        { status: 404 },
      );
    }

    // 3. Update the student's metadata to set isKtuVerified to true
    const currentMetadata = studentReq.user.user_metadata;
    const { data: updateData, error: updateErr } =
      await supabaseAdmin.auth.admin.updateUserById(studentId, {
        user_metadata: { ...currentMetadata, isKtuVerified: true },
      });

    if (updateErr) {
      console.error("Error verifying student:", updateErr);
      return NextResponse.json(
        { error: "Failed to verify student." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, user: updateData.user });
  } catch (error) {
    console.error("Unexpected error in verify-student route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
