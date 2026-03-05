import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { batchCode } = await request.json();

    if (!batchCode || typeof batchCode !== "string") {
      return NextResponse.json(
        { error: "Batch code is required" },
        { status: 400 },
      );
    }

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

    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

    // Call external FastAPI backend
    const backendRes = await fetch(`${NEXT_PUBLIC_API_URL}/batches/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        batch_code: batchCode,
        student_id: user.id,
      }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      // e.g. code not found
      return NextResponse.json(
        { error: data.detail || "Failed to join batch" },
        { status: backendRes.status },
      );
    }

    return NextResponse.json({ success: true, batch: data.batch });
  } catch (error) {
    console.error("Unexpected error in batches/join route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
