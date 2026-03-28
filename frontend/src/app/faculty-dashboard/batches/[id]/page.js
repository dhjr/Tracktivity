"use client";

import { useRequireRole } from "@/hooks/useRequireRole";
import { getAuthHeaders } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Users, Trash2, FileText, ArrowLeft, LayoutDashboard, Loader2, Sparkles, ShieldAlert } from "lucide-react";
import BatchNavCard from "@/components/BatchNavCard";
import PageLoader from "@/components/PageLoader";
import BatchCodeBadge from "@/components/BatchCodeBadge";

export default function FacultyBatchPage({ params }) {
  const { user, isReady } = useRequireRole("faculty");
  const router = useRouter();
  const { id: batchId } = use(params);

  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteBatch, setConfirmDeleteBatch] = useState(false);
  const [deleteBatchLoading, setDeleteBatchLoading] = useState(false);

  useEffect(() => {
    if (isReady) fetchBatchDetails();
  }, [isReady, batchId]);

  const fetchBatchDetails = async () => {
    setLoading(true);
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const res = await fetch(`${API_URL}/batches/${batchId}/members`, { headers });
      if (!res.ok) {
        if (res.status === 404) router.push("/faculty-dashboard");
        throw new Error("Failed to fetch batch details");
      }
      const data = await res.json();
      setBatch(data.batch);
      setStudents(data.students || []);
    } catch (err) {
      console.error("Error fetching batch details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async () => {
    setDeleteBatchLoading(true);
    try {
      const { headers, API_URL } = await getAuthHeaders();
      const res = await fetch(`${API_URL}/batches/${batchId}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Failed to delete batch");
      router.push("/faculty-dashboard");
    } catch (err) {
      console.error("Error deleting batch:", err);
      alert("Failed to delete batch. Please try again.");
      setDeleteBatchLoading(false);
      setConfirmDeleteBatch(false);
    }
  };

  if (!user || loading) return <PageLoader />;

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10">
        {/* Navigation / Breadcrumbs */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
           <Link 
            href="/faculty-dashboard" 
            className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-colors"
           >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
           </Link>
        </div>

        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-background" />
               </div>
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Batch Administration</span>
            </div>
            <h1 className="text-4xl font-display font-medium tracking-tight text-foreground">
              {batch?.name}
            </h1>
            <div className="flex items-center gap-4 mt-3">
              <BatchCodeBadge code={batch?.batch_code} />
              <div className="h-4 w-px bg-border/40" />
              <p className="text-sm text-foreground/60 flex items-center gap-2 font-light">
                <Users className="w-4 h-4 text-foreground/30" /> 
                <span className="font-medium text-foreground/80">{students.length}</span> Enrolled Students
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button
                onClick={() => setConfirmDeleteBatch(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-500 transition-all active:scale-[0.98]"
              >
                <Trash2 className="w-4 h-4" /> Delete Batch
              </button>
          </div>
        </div>

        {/* Navigation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          <BatchNavCard
            href={`/faculty-dashboard/batches/${batchId}/members`}
            icon={<Users className="w-6 h-6" />}
            label="Batch Roster"
            description="View and manage enrolled students, their details and point summaries."
            variant="primary"
          />
          <BatchNavCard
            href={`/faculty-dashboard/batches/${batchId}/submissions`}
            icon={<FileText className="w-6 h-6" />}
            label="Activity Submissions"
            description="Review and approve pending activity point requests from this batch."
          />
        </div>

        {/* Empty State / Additional Info */}
        <div className="mt-12 p-8 bg-secondary/5 border border-border/30 border-dashed rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in duration-1000 delay-300">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-background border border-border/50 flex items-center justify-center shadow-sm shrink-0">
                 <Sparkles className="w-6 h-6 text-foreground/20" />
              </div>
              <div className="max-w-md">
                 <h4 className="text-sm font-bold text-foreground/80 uppercase tracking-widest mb-1">Batch Insights</h4>
                 <p className="text-xs text-foreground/40 font-light leading-relaxed">
                    Student activity summaries and breakdown reports are available in the main Analytics & Reports section.
                 </p>
              </div>
           </div>
           <Link 
            href="/faculty-dashboard/reports" 
            className="px-6 py-3 bg-foreground text-background rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 transition-all active:scale-[0.98]"
           >
              Generate Reports
           </Link>
        </div>
      </div>

      {/* Delete Batch Confirmation Modal */}
      {confirmDeleteBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-background border border-border shadow-2xl rounded-[2.5rem] p-10 w-full max-w-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
               <ShieldAlert className="w-48 h-48" />
            </div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center mb-8">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              
              <h3 className="text-3xl font-display font-medium tracking-tight mb-4 text-foreground">
                Destroy this Batch?
              </h3>
              
              <p className="text-foreground/50 text-sm font-light leading-relaxed mb-10 max-w-md">
                You are about to permanently delete <span className="font-bold text-foreground">"{batch?.name}"</span>. 
                This action will revoke all student access and scrub batch records from the system. <br/><br/>
                <span className="text-red-500 font-medium italic">This cannot be undone.</span>
              </p>
              
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => setConfirmDeleteBatch(false)}
                  className="px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-secondary transition-all"
                  disabled={deleteBatchLoading}
                >
                  Return to safety
                </button>
                <button
                  onClick={handleDeleteBatch}
                  disabled={deleteBatchLoading}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl shadow-red-500/20 disabled:opacity-50 active:scale-[0.98]"
                >
                  {deleteBatchLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
