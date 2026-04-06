import { getServerAuthHeaders } from "@/utils/server-api";
import SubmissionsClient from "./SubmissionsClient";
import { redirect } from "next/navigation";

export default async function StudentSubmissionsPage({ params }) {
  const { id: batchId } = await params;
  const { API_URL, headers } = await getServerAuthHeaders();

  // If no auth headers, redirect to login
  if (!headers.Authorization || headers.Authorization.includes("undefined")) {
    redirect("/login");
  }

  let batchName = "";
  let initialSubmissions = [];

  try {
    const [batchRes, submissionsRes] = await Promise.all([
      fetch(`${API_URL}/batches/${batchId}`, { headers, next: { revalidate: 0 } }),
      fetch(`${API_URL}/student/dashboard?view=all`, { headers, next: { revalidate: 0 } }),
    ]);

    if (batchRes.ok) {
      const batchData = await batchRes.json();
      batchName = batchData.name;
    }

    if (submissionsRes.ok) {
      const subData = await submissionsRes.json();
      initialSubmissions = subData.submissions || [];
    }
  } catch (err) {
    console.error("Error fetching submissions on server:", err);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full relative bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <SubmissionsClient 
        initialSubmissions={initialSubmissions} 
        batchId={batchId} 
        batchName={batchName} 
      />
    </div>
  );
}
