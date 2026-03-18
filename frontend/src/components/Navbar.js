"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname();

  if (!user) return null;


  const userName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const userRole = user?.user_metadata?.role || "student";

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    {
      name: "Dashboard",
      href:
        userRole === "faculty" ? "/faculty-dashboard" : "/student-dashboard",
    },
    { name: "Guidelines", href: "/guidelines" },
    ...(userRole === "faculty" ? [{ name: "Reports", href: "/faculty-dashboard/reports" }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 w-full bg-background border-b border-border">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-between h-14">
        {user ? (
          <>
            {/* Logged-in user navbar */}
            <div className="flex items-center gap-8">
              <Link
                href={userRole === "faculty" ? "/faculty-dashboard" : "/student-dashboard"}
                className="font-display font-semibold text-foreground tracking-tight flex items-center gap-2"
              >
                <img 
                  src="/logo.png" 
                  alt="Tracktivity" 
                  className="w-8 h-8 rounded-lg"
                />
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm transition-colors ${
                      pathname === link.href
                        ? "text-foreground font-medium"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center">
                <ThemeToggle className="p-2 rounded-full hover:bg-secondary transition-colors" />
                <Link
                  href="/profile"
                  className="text-foreground/60 hover:text-foreground transition-colors p-2 rounded-full hover:bg-secondary"
                  aria-label="Profile"
                >
                  <User className="w-5 h-5" />
                </Link>
              </div>
              <button
                onClick={logout}
                className="ml-2 px-3 py-1.5 text-xs font-medium text-foreground/70 hover:text-foreground border border-border rounded-md hover:bg-secondary transition-all active:scale-95"
              >
                Log out
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Logged-out user navbar - only theme toggle */}
            <div className="flex-1" />
            <div className="flex items-center">
              <ThemeToggle className="p-2 rounded-full hover:bg-secondary transition-colors" />
            </div>
            <div className="flex-1" />
          </>
        )}

        {/* Mobile menu button - only for logged-in users */}
        {user && (
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-1 text-foreground/70 hover:text-foreground transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="block h-5 w-5" />
              ) : (
                <Menu className="block h-5 w-5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu - only for logged-in users */}
      {user && isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 flex flex-col space-y-4 shadow-sm pb-6">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/logo.png" 
              alt="Tracktivity" 
              className="w-6 h-6 rounded-lg"
            />
            <span className="font-display font-semibold text-foreground">Tracktivity</span>
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-sm ${
                pathname === link.href
                  ? "text-foreground font-medium"
                  : "text-foreground/70"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-border/50 flex flex-col space-y-4 text-sm">
            <Link
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 text-foreground/70 py-2 hover:text-foreground transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </Link>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-foreground/70 font-medium">Theme</span>
              <ThemeToggle className="p-2 rounded-full hover:bg-secondary transition-colors border border-border" />
            </div>
            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full mt-2 py-2.5 text-center text-sm font-medium text-foreground bg-secondary/50 hover:bg-secondary border border-border rounded-lg transition-all active:scale-[0.98]"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
