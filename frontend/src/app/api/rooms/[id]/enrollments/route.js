import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const roomId = (await params).id;
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

    // Verify faculty owns this room
    const { data: room, error: roomErr } = await supabase
      .from("rooms")
      .select("id, name, join_code")
      .eq("id", roomId)
      .eq("created_by", user.id)
      .single();

    if (roomErr || !room) {
      return NextResponse.json(
        { error: "Room not found or unauthorized" },
        { status: 404 },
      );
    }

    // Fetch enrollments. We need the user metadata (name, email, ktu id).
    // Supabase auth.users isn't directly queryable from the public schema easily with standard RLS
    // unless you create a view. However, since the faculty has the service role key available in our other route
    // (api/get-students), we could either merge data or create an RPC.
    // For simplicity, let's fetch the enrollment list which has student_id, then fetch all users via service_role,
    // and map them together. Wait! The API route `api/get-students` is already doing the service_role fetch perfectly!

    // We can fetch the raw enrollments:
    const { data: enrollments, error: enrollErr } = await supabase
      .from("enrollments")
      .select("student_id, status, enrolled_at")
      .eq("room_id", roomId)
      .order("enrolled_at", { ascending: false });

    if (enrollErr) {
      console.error("Error fetching enrollments:", enrollErr);
      return NextResponse.json(
        { error: "Failed to fetch enrollments" },
        { status: 500 },
      );
    }

    // Now fetch students from auth.users using the service role key
    const { createClient: createAdminClient } =
      await import("@supabase/supabase-js");
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const {
      data: { users },
      error: adminError,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (adminError) {
      console.error("Error fetching users via admin:", adminError);
      return NextResponse.json(
        { error: "Failed to fetch student details" },
        { status: 500 },
      );
    }

    // Merge the data
    const mergedEnrollments = enrollments.map((enr) => {
      const student = users.find((u) => u.id === enr.student_id);
      return {
        ...enr,
        studentName: student?.user_metadata?.name || "Unknown",
        studentEmail: student?.email || "Unknown",
        ktuId: student?.user_metadata?.ktuId || "N/A",
        isKtuVerified: student?.user_metadata?.isKtuVerified === true,
      };
    });

    return NextResponse.json({ room, enrollments: mergedEnrollments });
  } catch (error) {
    console.error("Unexpected error in rooms/[id]/enrollments route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
