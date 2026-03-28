"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import Navbar from "@/components/Navbar";
import ThemeToggle from "@/components/ThemeToggle";
import { usePathname } from "next/navigation";
import PageLoader from "@/components/PageLoader";

export default function LayoutWrapper({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();


  const showNavbar = !!user;
  // Stability improvement: Apply padding based on route prefix even before auth is resolved
  const isDashboard = pathname.startsWith("/student-dashboard") || 
                      pathname.startsWith("/faculty-dashboard") || 
                      pathname === "/profile" || 
                      pathname === "/guidelines";

  return (
    <>
      {showNavbar ? (
        <Navbar />
      ) : (
        pathname !== "/" && <ThemeToggle />
      )}
      <main className={isDashboard ? "pt-16" : ""}>
        {children}
      </main>
    </>
  );
}
