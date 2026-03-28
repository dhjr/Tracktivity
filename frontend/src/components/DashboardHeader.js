"use client";

import React from "react";

/**
 * DashboardHeader Component
 * 
 * A reusable header for portal dashboards that enforces the premium minimalist design language.
 * 
 * @param {string} name - The user's name to display.
 * @param {string} [badge] - An optional badge text (e.g. role, category).
 * @param {string} [subtitle] - An optional descriptive subtitle.
 * @param {React.ReactNode} [children] - Optional right-side content/actions.
 */
export default function DashboardHeader({ name, badge, subtitle, children }) {
  return (
    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-5xl font-display font-medium tracking-tight text-foreground flex flex-wrap items-baseline gap-4 sm:gap-6 leading-tight">
          <span className="opacity-40">Welcome back,</span>
          <span className="text-foreground/90 transition-colors hover:text-foreground">
            {name || "User"}
          </span>
          {badge && (
            <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-primary whitespace-nowrap ml-1 sm:ml-2 align-middle mb-1 sm:mb-2 translate-y-[-2px]">
              {badge}
            </div>
          )}
        </h1>
        {subtitle && (
          <p className="text-sm md:text-base text-foreground/40 font-light italic mt-2">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 self-start md:self-end">
          {children}
        </div>
      )}
    </div>
  );
}
