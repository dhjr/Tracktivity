"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function Select({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className = "",
  variant = "form", // 'form' or 'calendar'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue) => {
    if (disabled) return;
    onChange({ target: { value: optionValue } }); // Mocking event structure for ease of migration
    setIsOpen(false);
  };

  const isCalendar = variant === "calendar";

  return (
    <div className={`relative ${isCalendar ? "" : "w-full"} ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between transition-all outline-none
          ${isCalendar
            ? "text-[11px] font-medium bg-transparent hover:bg-secondary px-1.5 py-1 rounded gap-1"
            : "w-full px-5 py-3.5 bg-background/50 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-border text-sm font-medium"
          }
          ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
          ${isOpen && !isCalendar ? "ring-2 ring-primary/10 border-border" : ""}
        `}
      >
        <span className={`${!selectedOption && !isCalendar ? "text-foreground/40" : "text-foreground"} truncate`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`
            transition-transform duration-300 
            ${isCalendar ? "w-3 h-3" : "w-4 h-4"} 
            ${isOpen ? "rotate-180" : ""} 
            text-foreground/30
          `} 
        />
      </button>

      {isOpen && (
        <div 
          className={`
            absolute z-50 mt-2 min-w-full overflow-hidden
            bg-background/90 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl 
            animate-in fade-in zoom-in-95 duration-200 origin-top
            ${isCalendar ? "top-full left-0 w-32" : "top-full left-0"}
          `}
        >
          <div className="max-h-60 overflow-y-auto p-1.5">
            {options.map((option) => {
              const isActive = option.value === value;
              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-all
                    ${isActive 
                      ? "bg-foreground text-background font-bold shadow-lg shadow-foreground/10" 
                      : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                    }
                  `}
                >
                  <span className="truncate">{option.label}</span>
                  {isActive && <Check className="w-3.5 h-3.5" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
