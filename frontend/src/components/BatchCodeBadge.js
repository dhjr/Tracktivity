"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

/**
 * Displays a batch code with a one-click copy-to-clipboard button.
 * Designed to work inline on both dashboard cards and batch detail headers.
 *
 * @param {string} code - The batch code to display and copy.
 * @param {"sm"|"md"} size - Visual size variant. Defaults to "md".
 */
export default function BatchCodeBadge({ code, size = "md" }) {
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  const handleCopy = (e) => {
    e.preventDefault(); // Don't trigger parent Link/button
    e.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isSmall = size === "sm";

  return (
    <button
      onClick={handleCopy}
      title="Click to copy batch code"
      className={`inline-flex items-center gap-1.5 rounded group transition-all
        ${isSmall
          ? "px-2 py-1 bg-secondary/40 hover:bg-secondary/70 text-foreground/60 hover:text-foreground"
          : "px-3 py-1.5 bg-secondary/30 hover:bg-secondary/60 text-foreground/70 hover:text-foreground"
        }`}
    >
      <span className={`uppercase tracking-wider font-semibold ${isSmall ? "text-[9px]" : "text-[10px]"} text-foreground/40`}>
        Code
      </span>
      <span className={`font-mono font-bold tracking-widest ${isSmall ? "text-xs" : "text-sm"}`}>
        {code}
      </span>
      {copied ? (
        <Check className={`${isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} text-green-500 shrink-0`} />
      ) : (
        <Copy
          className={`${isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} text-foreground/30 group-hover:text-foreground/60 transition-colors shrink-0`}
        />
      )}
    </button>
  );
}
