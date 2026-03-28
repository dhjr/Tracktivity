"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import FeatureCard from "@/components/FeatureCard";
import { Presentation, GraduationCap, ArrowRight } from "lucide-react";

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
      <section className="min-h-screen flex items-center px-6 md:px-12 py-20 relative z-10">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column: Text Content */}
          <div className="flex flex-col items-start space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="space-y-4 text-left">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-medium text-foreground tracking-tight leading-[1.1] max-w-xl">
                KTU{" "}
                <span className="text-foreground/30 italic">
                  activity points,
                </span>
                <br />
                made{" "}
                <span className="relative inline-block transition-transform hover:scale-105 duration-300">
                  easier!
                  <div className="absolute bottom-2 left-0 w-full h-1.5 bg-primary/10 -z-10 rounded-full"></div>
                </span>
              </h1>

              <p className="text-base md:text-lg text-foreground/50 max-w-lg font-light leading-relaxed">
                Avoid last-minute certificate stress! The premium dashboard for
                KTU students and faculty to track progress with elegance and
                efficiency.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
              <Link
                href="/signup"
                className="group relative px-8 py-4 bg-foreground text-background text-sm font-bold rounded-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-foreground/10 text-center flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 border border-border/50 text-sm font-bold hover:bg-secondary/50 transition-all rounded-xl text-foreground backdrop-blur-md active:scale-[0.98] text-center"
              >
                Log In
              </Link>
            </div>
          </div>

          {/* Right Column: Logo / Visual Element */}
          <div className="hidden lg:flex justify-end animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="relative group">
              {/* Decorative Glow */}
              <div className="absolute -inset-4 bg-linear-to-tr from-primary/20 via-primary/5 to-transparent rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>

              <div className="relative bg-secondary/5 border border-border/30 p-10 rounded-[3.5rem] backdrop-blur-sm shadow-2xl transition-transform duration-700 group-hover:-translate-y-2 group-hover:rotate-2">
                <img
                  src="/logo.png"
                  alt="Tracktivity Logo"
                  className="w-48 h-48 md:w-64 md:h-64 rounded-[2.5rem] border border-border/50 shadow-2xl grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Heading */}
          <div className="mb-16">
            <h2 className="text-sm uppercase tracking-[0.4em] text-foreground/30 font-bold mb-4">
              What we offer
            </h2>
            <div className="h-px w-12 bg-primary/20" />
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            {/* Faculty Card */}
            <FeatureCard
              icon={Presentation}
              title="For faculty"
              accentColor="indigo"
              features={[
                "Easy submission verification",
                "Generate report on student submissions",
                "Easily approve/reject submissions.",
              ]}
            />

            {/* Student Card */}
            <FeatureCard
              icon={GraduationCap}
              title="For students"
              accentColor="emerald"
              features={[
                "Smart Document Management",
                "Category-wise Progress Tracking",
                "Instant Submission Alerts",
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
