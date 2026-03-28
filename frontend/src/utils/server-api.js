import { createClient } from "@/utils/supabase/server";

/**
 * Returns auth headers and the API base URL for Server Components.
 * @returns {Promise<{ headers: { Authorization: string }, API_URL: string }>}
 */
export async function getServerAuthHeaders() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
  return {
    API_URL,
    headers: { Authorization: `Bearer ${session?.access_token}` },
  };
}
