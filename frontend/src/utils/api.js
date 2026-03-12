import { createClient } from "@/utils/supabase/client";

/**
 * Returns auth headers and the API base URL.
 * Use in any page that needs to call the backend.
 * @returns {{ headers: { Authorization: string }, API_URL: string }}
 */
export async function getAuthHeaders() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return {
    API_URL,
    headers: { Authorization: `Bearer ${session?.access_token}` },
  };
}
