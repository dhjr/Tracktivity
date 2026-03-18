"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Users, FileText, Shield, BarChart3, CheckCircle, ArrowRight, Zap, GraduationCap, Briefcase } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const userRole = user?.user_metadata?.role || "student";
      router.push(
        userRole === "faculty" ? "/faculty-dashboard" : "/student-dashboard",
      );
    }
  }, [user, router]);

  if (user) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Hero Content */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative z-10">
        <div className="max-w-5xl mx-auto w-full">
          {/* Logo and Badge */}
          <div className="flex flex-col items-center mb-12">
            <div className="mb-8 relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-primary/0 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <img 
                src="/logo.png" 
                alt="Tracktivity Logo" 
                className="w-20 h-20 rounded-2xl relative border border-border/50 shadow-2xl"
              />
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary/60"></span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-foreground/60">KTU Activity Points • Simplified</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-medium mb-6 text-foreground tracking-tighter text-center leading-[1.1]">
              Track your <span className="text-foreground/40 italic">progress,</span><br />
              elevate your <span className="relative inline-block">
                journey.
                <div className="absolute bottom-2 left-0 w-full h-1 bg-primary/10 -z-10 rounded-full"></div>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-foreground/60 mb-12 max-w-2xl mx-auto leading-relaxed text-center font-light">
              The premium dashboard for KTU students and faculty to manage, 
              verify, and track activity points with elegance and precision.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <Link
                href="/signup"
                className="group relative px-8 py-4 bg-foreground text-background text-base font-medium rounded-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-foreground/10"
              >
                <div className="relative z-10 flex items-center gap-2">
                  Get Started for Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 border border-border text-base font-medium hover:bg-secondary/80 transition-all rounded-xl text-foreground backdrop-blur-sm active:scale-[0.98]"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>

          {/* Quick Info Cards - Redesigned as Premium Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {/* Faculty Card */}
            <div className="group p-8 bg-secondary/5 border border-border/50 rounded-3xl hover:bg-secondary/10 transition-all duration-500 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-foreground/5 group-hover:text-foreground/10 transition-colors duration-500">
                <Briefcase size={80} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                  <GraduationCap className="w-6 h-6 text-foreground/70" />
                </div>
                <h3 className="text-2xl font-display font-medium text-foreground mb-4">Faculty Portal</h3>
                <p className="text-foreground/50 leading-relaxed mb-6">
                  Effortless verification at your fingertips. Manage entire batches, 
                  verify documents with one click, and export institutional reports instantly.
                </p>
                <ul className="space-y-3">
                  {['Bulk Approvals', 'Batch Management', 'Institutional Analytics'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-foreground/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Student Card */}
            <div className="group p-8 bg-secondary/5 border border-border/50 rounded-3xl hover:bg-secondary/10 transition-all duration-500 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-foreground/5 group-hover:text-foreground/10 transition-colors duration-500">
                <Zap size={80} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                  <Users className="w-6 h-6 text-foreground/70" />
                </div>
                <h3 className="text-2xl font-display font-medium text-foreground mb-4">Student Hub</h3>
                <p className="text-foreground/50 leading-relaxed mb-6">
                  Track your journey to 100 points. Upload certificates, monitor 
                  approval live, and stay ahead of your requirements with ease.
                </p>
                <ul className="space-y-3">
                  {['Document Upload', 'Live Progress Tracking', 'Instant Notifications'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-foreground/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple, Clean Footer */}
      <footer className="py-12 px-4 border-t border-border/30 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 opacity-50 grayscale" />
            <span className="text-sm font-display font-medium text-foreground/40">Tracktivity</span>
          </div>
          <div className="text-[12px] text-foreground/30 font-light">
            © {new Date().getFullYear()} Tracktivity. Designed for KTU Excellence.
          </div>
          <div className="flex gap-6">
            <Link href="/login" className="text-xs text-foreground/40 hover:text-foreground transition-colors">Login</Link>
            <Link href="/signup" className="text-xs text-foreground/40 hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

