import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Helper function to generate a random 8-character alphanumeric string
function generateBatchCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "BATCH-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request) {
  try {
    const { name } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Batch name is required" },
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
        { error: "Forbidden. Only faculty can create batches." },
        { status: 403 },
      );
    }

    // 2. Generate batch code and call the FastAPI endpoint
    const batchCode = generateBatchCode();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const res = await fetch(`${API_URL}/batches/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        batch_code: batchCode,
        created_by: user.id,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || "Failed to create batch via backend");
    }

    return NextResponse.json({ success: true, batch: data.batch });
  } catch (error) {
    console.error("Unexpected error in batches/create route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
