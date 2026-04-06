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
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

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

  const toggleOpen = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      const menuHeight = Math.min(240, options.length * 40 + 12);
      if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
        setPopoverPos({ 
            top: rect.top - (menuHeight + 8), 
            left: rect.left, 
            width: rect.width 
        });
      } else {
        setPopoverPos({ 
            top: rect.bottom + 8, 
            left: rect.left, 
            width: rect.width 
        });
      }
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue) => {
    if (disabled) return;
    onChange({ target: { value: optionValue } }); // Mocking event structure for ease of migration
    setIsOpen(false);
  };

  const isCalendar = variant === "calendar";

  return (
    <div className={`relative ${isCalendar ? "" : "w-full"} ${className}`} ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && toggleOpen()}
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
          style={{
            position: 'fixed',
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
            width: isCalendar ? '128px' : `${popoverPos.width}px`,
            zIndex: 9999
          }}
          className={`
            overflow-hidden
            bg-background/90 backdrop-blur-xl border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200 origin-top
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
                    flex items-start justify-between px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-all
                    ${isActive 
                      ? "bg-foreground text-background font-bold shadow-lg shadow-foreground/10" 
                      : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                    }
                  `}
                >
                  <span className="flex-1 text-left leading-tight py-0.5">{option.label}</span>
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
