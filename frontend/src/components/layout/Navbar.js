"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/#pricing" },
    { name: "About", href: "/#about" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-4 relative z-50">
        <div className="bg-background rounded-xl flex items-center justify-between h-16 px-4 md:px-6 border border-border">
          {/* Logo */}
          <div className="shrink-0 flex items-center gap-2 z-10">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-lg md:text-xl font-bold text-primary-foreground leading-none">
                  T
                </span>
              </div>
              <span className="font-bold text-lg md:text-xl tracking-tight text-foreground group-hover:text-primary transition-colors hidden sm:block">
                Tractivity
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-8 z-0 relative">
            <div className="flex items-center space-x-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-max">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === link.href
                      ? "text-primary"
                      : "text-foreground/70"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4 shrink-0 z-10">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-foreground/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="text-sm font-bold text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute top-12 right-0 w-48 bg-background border border-border rounded-xl shadow-lg py-2 overflow-hidden flex flex-col">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-foreground/60 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="px-4 py-2 text-sm hover:bg-foreground/5 transition-colors text-left"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="px-4 py-2 text-sm hover:bg-foreground/5 transition-colors text-left"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all active:scale-95"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle className="p-2 rounded-xl text-foreground hover:bg-foreground/10 transition-colors focus:outline-none flex items-center justify-center group" />
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-xl text-foreground hover:bg-foreground/10 focus:outline-none transition-colors"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden fixed inset-0 z-30 bg-background transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full pt-28 px-6 pb-6 overflow-y-auto">
          <div className="flex flex-col space-y-4 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-2xl font-bold transition-colors hover:text-primary ${
                  pathname === link.href ? "text-primary" : "text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col space-y-4 pt-6 mt-6 border-t border-border">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-foreground/5 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="text-lg font-bold text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">
                      {user.name}
                    </span>
                    <span className="text-xs text-foreground/60 truncate">
                      {user.email}
                    </span>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl font-medium border border-border text-foreground hover:bg-secondary transition-colors"
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl font-medium border border-border text-foreground hover:bg-secondary transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-3 rounded-lg font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-95 transition-all"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl font-medium border border-border text-foreground hover:bg-secondary transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-lg font-medium bg-primary text-primary-foreground active:scale-95 transition-all"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
