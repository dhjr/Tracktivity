"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  eachDayOfInterval,
  getYear,
  getMonth,
  setYear as dateFnsSetYear,
  setMonth as dateFnsSetMonth,
  parseISO,
  isValid,
  isAfter,
  startOfToday,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  ChevronDown,
} from "lucide-react";
import Select from "@/components/ui/Select";

const CalendarPicker = ({ value, onChange, label = "Select Date" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Parse initial value if it exists
  useEffect(() => {
    if (value) {
      const date = typeof value === "string" ? parseISO(value) : value;
      if (isValid(date)) {
        setCurrentMonth(date);
      }
    }
  }, [value]);

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCalendar = () => {
    if (!isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Prefer below, but flip if no space
      if (spaceBelow < 320 && spaceAbove > 320) {
        setPopoverPos({ top: rect.top - 320, left: rect.left });
      } else {
        setPopoverPos({ top: rect.bottom + 8, left: rect.left });
      }
    }
    setIsOpen(!isOpen);
  };

  const onDateClick = (day) => {
    if (isAfter(day, new Date())) return;
    onChange(format(day, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  const nextMonth = () => {
    const next = addMonths(currentMonth, 1);
    if (isAfter(startOfMonth(next), new Date())) return;
    setCurrentMonth(next);
  };
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-2 py-2 border-b border-border bg-secondary/10">
        <div className="flex items-center gap-1">
          <Select
            variant="calendar"
            value={getMonth(currentMonth)}
            onChange={(e) => handleMonthChange(e.target.value)}
            options={[
              "Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            ].map((m, i) => ({
              label: m,
              value: i,
            }))}
          />

          <Select
            variant="calendar"
            value={getYear(currentMonth)}
            onChange={(e) => handleYearChange(e.target.value)}
            options={years.map((y) => ({
              label: y,
              value: y,
            }))}
          />
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevMonth();
            }}
            className="p-1 hover:bg-secondary rounded-full transition-colors text-foreground/60 hover:text-foreground"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextMonth();
            }}
            disabled={isAfter(startOfMonth(addMonths(currentMonth, 1)), new Date())}
            className="p-1 hover:bg-secondary rounded-full transition-colors text-foreground/60 hover:text-foreground disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-2 border-b border-border bg-secondary/20">
        {days.map((day) => (
          <div
            key={day}
            className="py-2 text-[10px] font-bold text-center uppercase tracking-widest text-foreground/40"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isSelected =
          value &&
          isSameDay(day, typeof value === "string" ? parseISO(value) : value);
        const isFuture = isAfter(day, new Date());
        const isDisabled = !isSameMonth(day, monthStart) || isFuture;

        days.push(
          <div
            key={day.toString()}
            className={`
              relative h-8 flex items-center justify-center text-xs cursor-pointer transition-all
              ${isDisabled ? "text-foreground/20 pointer-events-none" : "text-foreground hover:bg-secondary"}
              ${isSelected ? "bg-foreground text-background font-bold hover:bg-foreground/90" : ""}
              ${isSameDay(day, new Date()) && !isSelected ? "text-foreground font-bold border-b-2 border-foreground" : ""}
            `}
            onClick={() => !isDisabled && onDateClick(cloneDay)}
          >
            {format(day, "d")}
          </div>,
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>,
      );
      days = [];
    }
    return <div className="p-1">{rows}</div>;
  };

  // Year Selection Dropdown Logic
  const currentYearVisible = getYear(currentMonth);
  const currentActualYear = getYear(new Date());
  const years = Array.from({ length: 11 }, (_, i) => currentActualYear - 10 + i);

  const handleYearChange = (year) => {
    const newDate = dateFnsSetYear(currentMonth, parseInt(year));
    if (isAfter(startOfMonth(newDate), new Date())) return;
    setCurrentMonth(newDate);
  };

  const handleMonthChange = (monthIdx) => {
    const newDate = dateFnsSetMonth(currentMonth, parseInt(monthIdx));
    if (isAfter(startOfMonth(newDate), new Date())) return;
    setCurrentMonth(newDate);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2">
        {label}
      </label>
      <div
        ref={inputRef}
        className="relative group cursor-pointer"
        onClick={toggleCalendar}
      >
        <input
          type="text"
          readOnly
          placeholder="YYYY-MM-DD"
          className="w-full px-4 py-2.5 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors cursor-pointer font-mono"
          value={value || ""}
        />
        <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 group-hover:text-foreground transition-colors" />
      </div>

      {isOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            top: `${popoverPos.top}px`, 
            left: `${popoverPos.left}px`,
            zIndex: 9999
          }}
          className="w-[240px] bg-background border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        >
          {renderHeader()}
          {renderDays()}
          {renderCells()}

          <div className="p-2 border-t border-border flex justify-end">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                onChange(format(today, "yyyy-MM-dd"));
                setCurrentMonth(today);
                setIsOpen(false);
              }}
              className="text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-secondary px-3 py-1.5 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPicker;
