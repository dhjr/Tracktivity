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
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";

const CalendarPicker = ({ value, onChange, label = "Select Date" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef(null);

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

  const onDateClick = (day) => {
    onChange(format(day, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevMonth();
            }}
            className="p-1.5 hover:bg-secondary rounded-full transition-colors text-foreground/60 hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextMonth();
            }}
            className="p-1.5 hover:bg-secondary rounded-full transition-colors text-foreground/60 hover:text-foreground"
          >
            <ChevronRight className="w-4 h-4" />
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
        const isDisabled = !isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
            className={`
              relative h-9 flex items-center justify-center text-xs cursor-pointer transition-all
              ${isDisabled ? "text-foreground/20" : "text-foreground hover:bg-secondary"}
              ${isSelected ? "bg-foreground text-background font-bold hover:bg-foreground/90" : ""}
              ${isSameDay(day, new Date()) && !isSelected ? "text-foreground font-bold border-b-2 border-foreground" : ""}
            `}
            onClick={() => onDateClick(cloneDay)}
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
  const currentYear = getYear(currentMonth);
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  const handleYearChange = (year) => {
    setCurrentMonth(dateFnsSetYear(currentMonth, parseInt(year)));
  };

  const handleMonthChange = (monthIdx) => {
    setCurrentMonth(dateFnsSetMonth(currentMonth, parseInt(monthIdx)));
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div
        className="relative group cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <input
          type="text"
          readOnly
          placeholder="YYYY-MM-DD"
          className="w-full px-4 py-2.5 text-sm bg-background border border-border focus:border-foreground focus:outline-none transition-colors cursor-pointer"
          value={value || ""}
        />
        <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 group-hover:text-foreground transition-colors" />
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 w-[280px] bg-background border border-border shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-1 p-2 bg-secondary/10 border-b border-border">
            <select
              value={getMonth(currentMonth)}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="text-[11px] font-medium bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-secondary px-2 py-1 rounded"
            >
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={getYear(currentMonth)}
              onChange={(e) => handleYearChange(e.target.value)}
              className="text-[11px] font-medium bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-secondary px-2 py-1 rounded"
            >
              {Array.from(
                { length: 50 },
                (_, i) => new Date().getFullYear() - 25 + i,
              ).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="ml-auto p-1 text-foreground/40 hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

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
