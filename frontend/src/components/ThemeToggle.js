"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useEffect, useState } from "react";

export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className={
        className !== undefined
          ? className
          : "fixed bottom-6 right-6 md:top-6 md:right-6 md:bottom-auto z-50 p-3 rounded-full bg-background border border-border shadow-sm hover:bg-secondary transition-all duration-300 active:scale-95 group"
      }
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-400 group-hover:rotate-45 transition-transform duration-500" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700 group-hover:-rotate-12 transition-transform duration-500" />
      )}
    </button>
  );
}
