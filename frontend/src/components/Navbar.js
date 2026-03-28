"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut, LayoutDashboard, FileText, BarChart3, Settings } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useStats } from "@/components/providers/StatsProvider";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { stats } = useStats();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!user) return null;

  const userRole = user?.user_metadata?.role || "student";

  const navLinks = [
    {
      name: "Dashboard",
      href: userRole === "faculty" ? "/faculty-dashboard" : "/student-dashboard",
      icon: LayoutDashboard,
    },
    { name: "Guidelines", href: "/guidelines", icon: FileText },
    ...(userRole === "faculty" ? [{ name: "Reports", href: "/faculty-dashboard/reports", icon: BarChart3 }] : []),
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 border-b ${
        scrolled 
          ? "py-3 bg-background/90 backdrop-blur-xl border-border/50 shadow-sm" 
          : "py-5 bg-background/20 backdrop-blur-sm border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
        {/* Logo & Desktop Nav */}
        <div className="flex items-center gap-12">
          <Link
            href={userRole === "faculty" ? "/faculty-dashboard" : "/student-dashboard"}
            className="group flex items-center gap-3 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-background/50 border border-border/50 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:shadow-primary/5 group-hover:rotate-6 transition-all duration-500 overflow-hidden relative">
               <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <img 
                  src="/logo.png" 
                  alt="T" 
                  className="w-7 h-7 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground hidden sm:block">
              Tracktivity
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 rounded-xl group ${
                    isActive
                      ? "text-foreground bg-foreground/5 shadow-sm"
                      : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <div className="absolute bottom-1.5 left-4 right-4 h-px bg-foreground/60 animate-in fade-in zoom-in duration-500" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 p-1 bg-secondary/10 rounded-2xl border border-border/30">
            <ThemeToggle className="p-2.5 rounded-xl hover:bg-background hover:shadow-sm transition-all text-foreground/70 hover:text-foreground" />
            <Link
              href="/profile"
              className={`p-2.5 rounded-xl transition-all flex items-center gap-2 group ${
                pathname === "/profile"
                  ? "bg-foreground text-background"
                  : "hover:bg-background hover:shadow-sm text-foreground/70 hover:text-foreground"
              }`}
            >
              <User className="w-4 h-4" />
              {pathname === "/profile" && (
                 <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Profile</span>
              )}
            </Link>
          </div>

          <button
            onClick={logout}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-secondary/40 hover:bg-secondary border border-border/50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-foreground/80 hover:text-foreground transition-all active:scale-[0.98] group"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            <span>Sign Out</span>
          </button>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 bg-secondary/20 border border-border/50 rounded-xl text-foreground hover:bg-secondary transition-all active:scale-90"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 transition-all duration-500 origin-top ${
          isMobileMenuOpen 
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" 
            : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        <div className="mx-4 mt-2 p-6 bg-background border border-border/50 rounded-3xl shadow-2xl space-y-6">
          <div className="grid grid-cols-1 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    isActive
                      ? "bg-foreground text-background shadow-lg shadow-foreground/10"
                      : "bg-secondary/20 hover:bg-secondary/40 text-foreground/80"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-widest">{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-border/30 flex flex-col gap-3">
             <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-border/30">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-background rounded-lg border border-border/50">
                      <Settings className="w-4 h-4 text-foreground/60" />
                   </div>
                   <span className="text-xs font-bold uppercase tracking-widest text-foreground/60">Appearance</span>
                </div>
                <ThemeToggle className="p-2 bg-background rounded-xl border border-border/50" />
             </div>
             
             <button
                onClick={logout}
                className="w-full py-4 px-6 bg-primary/10 border border-primary/20 rounded-2xl text-primary text-sm font-bold uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center justify-center gap-3"
             >
                <LogOut className="w-4 h-4" />
                Sign Out Account
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
