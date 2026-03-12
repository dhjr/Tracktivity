import { Crown, BookUser, GraduationCap } from "lucide-react";

/**
 * Inline role badge pill.
 * @param {"faculty"|"student"} role
 * @param {boolean} isAdmin
 */
export default function RoleBadge({ role, isAdmin }) {
  if (role === "faculty" && isAdmin) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
        <Crown className="w-2.5 h-2.5" /> Admin
      </span>
    );
  }
  if (role === "faculty") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-blue-500/15 text-blue-600 dark:text-blue-400">
        <BookUser className="w-2.5 h-2.5" /> Faculty
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-foreground/10 text-foreground/50">
      <GraduationCap className="w-2.5 h-2.5" /> Student
    </span>
  );
}
