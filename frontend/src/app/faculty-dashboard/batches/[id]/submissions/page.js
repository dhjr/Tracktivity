import { getServerAuthHeaders } from "@/utils/server-api";
import SubmissionsClient from "./SubmissionsClient";
import { redirect } from "next/navigation";

export default async function BatchSubmissionsPage({ params }) {
  const { id: batchId } = await params;
  const { API_URL, headers } = await getServerAuthHeaders();

  // Basic auth check
  if (!headers.Authorization || headers.Authorization.includes("undefined")) {
    redirect("/login");
  }

  let batch = null;
  let students = [];

  try {
    const [batchRes, subsRes] = await Promise.all([
      fetch(`${API_URL}/batches/${batchId}`, { headers, next: { revalidate: 0 } }),
      fetch(`${API_URL}/faculty/batches/${batchId}/submissions`, { headers, next: { revalidate: 0 } }),
    ]);

    if (batchRes.ok) batch = await batchRes.json();

    if (subsRes.ok) {
      const data = await subsRes.json();
      const map = {};
      for (const sub of data.submissions || []) {
        const sid = sub.student_id;
        if (!map[sid]) {
          map[sid] = {
            id: sid,
            name: sub.student?.full_name || "Unknown",
            ktuid: sub.student?.ktuid || "",
            department: sub.student?.department || "",
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
          };
        }
        map[sid].total++;
        map[sid][sub.status] = (map[sid][sub.status] || 0) + 1;
      }
      students = Object.values(map).sort((a, b) => {
        if (a.pending !== b.pending) return b.pending - a.pending;
        return a.name.localeCompare(b.name);
      });
    }
  } catch (err) {
    console.error("Error fetching faculty submissions on server:", err);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <SubmissionsClient 
        batch={batch} 
        initialStudents={students} 
        batchId={batchId} 
      />
    </div>
  );
}
