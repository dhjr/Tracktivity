"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import Navbar from "@/components/Navbar";
import ThemeToggle from "@/components/ThemeToggle";
import { usePathname } from "next/navigation";
import PageLoader from "@/components/PageLoader";

export default function LayoutWrapper({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // If loading, show a loader
  if (loading) {
    return <PageLoader />;
  }

  // Show navbar only if user is logged in
  const showNavbar = !!user;

  return (
    <>
      {showNavbar ? (
        <Navbar />
      ) : (
        pathname !== "/" && <ThemeToggle />
      )}
      <main className={showNavbar ? "pt-16" : ""}>
        {children}
      </main>
    </>
  );
}
