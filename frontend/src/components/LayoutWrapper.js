"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import Navbar from "@/components/Navbar";
import ThemeToggle from "@/components/ThemeToggle";
import { usePathname } from "next/navigation";
import PageLoader from "@/components/PageLoader";

export default function LayoutWrapper({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/student-dashboard") || 
                      pathname.startsWith("/faculty-dashboard") || 
                      pathname === "/profile" || 
                      pathname === "/guidelines";

  const showNavbar = !!user;

  if (loading && isDashboard) {
    return (
      <div className="pt-16 min-h-[calc(100vh-4rem)] bg-background flex flex-col">
        <PageLoader />
      </div>
    );
  }

  return (
    <>
      {showNavbar ? (
        <Navbar />
      ) : (
        pathname !== "/" && <ThemeToggle />
      )}
      <main className={`${isDashboard ? "pt-16" : ""} overflow-x-clip`}>
        {children}
      </main>
    </>
  );
}
