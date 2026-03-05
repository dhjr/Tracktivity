"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const userRole = user?.user_metadata?.role || "student";

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    ...(user
      ? []
      : [
          {
            name: "Home",
            href: "/",
          },
        ]),
    {
      name: "Dashboard",
      href:
        userRole === "faculty" ? "/faculty-dashboard" : "/student-dashboard",
    },
    { name: "Guidelines", href: "/guidelines" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 w-full bg-background border-b border-border">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-semibold text-foreground tracking-tight"
          >
            Tractivity.
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
          {user ? (
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-foreground/60">{userName}</span>
              <Link
                href="/profile"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 text-sm">
              <Link
                href="/login"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-foreground font-medium hover:text-foreground/80 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
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
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 flex flex-col space-y-4 shadow-sm pb-6">
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
            {user ? (
              <>
                <span className="text-foreground/50">{userName}</span>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-left text-foreground/70"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-foreground/70"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground/70"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground font-medium"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
