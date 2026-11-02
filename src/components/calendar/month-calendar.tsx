"use client";

import React, { useState } from "react";
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
  subDays,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { cn } from "@/lib/utils";

export function MonthCalendar() {
  const { selectedDate, setSelectedDate, calendarEvents, tasks } = useDemo();
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date("2026-11-02T00:00:00"));
  const [todayDate, setTodayDate] = useState<Date>(() => new Date("2026-11-02T00:00:00"));
  const [mobileView, setMobileView] = useState<"week" | "month">("week");

  React.useEffect(() => {
    const now = new Date();
    setTodayDate(now);
    setCurrentMonth(now);
  }, []);

  // Synchronize current month with selectedDate if selected date changes outside current view
  React.useEffect(() => {
    if (!isSameMonth(selectedDate, currentMonth)) {
      setCurrentMonth(startOfMonth(selectedDate));
    }
  }, [selectedDate]);

  const prevPeriod = () => {
    if (mobileView === "week") {
      const newDate = subDays(selectedDate, 7);
      setSelectedDate(newDate);
      setCurrentMonth(newDate);
    } else {
      setCurrentMonth(subMonths(currentMonth, 1));
    }
  };

  const nextPeriod = () => {
    if (mobileView === "week") {
      const newDate = addDays(selectedDate, 7);
      setSelectedDate(newDate);
      setCurrentMonth(newDate);
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  const goToToday = () => {
    setCurrentMonth(todayDate);
    setSelectedDate(todayDate);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Helper to determine indicators for a day
  const getIndicatorsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayEvents = calendarEvents.filter((e) => e.date === dateStr);
    const dayTasks = tasks.filter((t) => t.scheduledDate === dateStr);

    const hasAcademicOrMeeting = dayEvents.some(
      (e) => e.category === "academic" || e.category === "meeting"
    );
    const hasDeepWork =
      dayEvents.some((e) => e.category === "deep_work") ||
      dayTasks.some((t) => t.priority === "urgent" || t.priority === "high");
    const hasEcoOrPersonal =
      dayEvents.some((e) => e.category === "eco" || e.category === "personal") ||
      dayTasks.some((t) => t.category === "sustainability" || t.category === "personal");

    return {
      hasAcademicOrMeeting,
      hasDeepWork,
      hasEcoOrPersonal,
      totalCount: dayEvents.length + dayTasks.length,
    };
  };

  // Build grid days
  const rows: Date[][] = [];
  let days: Date[] = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = addDays(day, 1);
    }
    rows.push(days);
    days = [];
  }

  // Determine active week row
  const activeWeekRow =
    rows.find((r) => r.some((d) => isSameDay(d, selectedDate))) || rows[0] || [];

  const weekDayNames = [
    { short: "S", full: "Sun" },
    { short: "M", full: "Mon" },
    { short: "T", full: "Tue" },
    { short: "W", full: "Wed" },
    { short: "T", full: "Thu" },
    { short: "F", full: "Fri" },
    { short: "S", full: "Sat" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#e6e3da] shadow-xs overflow-hidden">
      {/* Calendar Header with Navigation */}
      <div className="px-3.5 sm:px-6 py-3 sm:py-4 border-b border-[#e6e3da] flex items-center justify-between bg-[#fdfcf9] gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block truncate">
              Interactive Planner Surface • Select a date to view agenda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mobile Week / Month Toggle */}
          <div className="sm:hidden flex items-center p-0.5 bg-[#f0ede6] rounded-lg border border-[#e6e3da]">
            <button
              onClick={() => setMobileView("week")}
              className={cn(
                "px-2 py-1 text-[10px] font-semibold rounded-md transition-all",
                mobileView === "week"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Week
            </button>
            <button
              onClick={() => setMobileView("month")}
              className={cn(
                "px-2 py-1 text-[10px] font-semibold rounded-md transition-all",
                mobileView === "month"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Month
            </button>
          </div>

          <button
            onClick={goToToday}
            className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-[#f0ede6] rounded-md transition-colors border border-[#e6e3da]"
          >
            Today
          </button>
          <div className="flex items-center border border-[#e6e3da] rounded-md bg-white">
            <button
              onClick={prevPeriod}
              className="p-1 sm:p-1.5 hover:bg-[#f5f3ec] text-slate-600 rounded-l-md transition-colors"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-3.5 sm:h-4 bg-[#e6e3da]" />
            <button
              onClick={nextPeriod}
              className="p-1 sm:p-1.5 hover:bg-[#f5f3ec] text-slate-600 rounded-r-md transition-colors"
              aria-label="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-[#e6e3da] bg-[#fbfaf6] text-center">
        {weekDayNames.map((d, i) => (
          <div
            key={d.full}
            className={cn(
              "py-1.5 sm:py-2.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider",
              i === 0 || i === 6 ? "text-slate-400" : "text-slate-600"
            )}
          >
            <span className="sm:hidden">{d.short}</span>
            <span className="hidden sm:inline">{d.full}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid — Renders single active week if mobileView === 'week' on small screens, else all rows */}
      <div className="divide-y divide-[#f0ede6]">
        {(mobileView === "week" ? [activeWeekRow] : rows).map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-7 divide-x divide-[#f0ede6]">
            {row.map((dayItem, dayIndex) => {
              const isSelected = isSameDay(dayItem, selectedDate);
              const isToday = isSameDay(dayItem, todayDate);
              const isCurrentMonthDay = isSameMonth(dayItem, currentMonth);
              const indicators = getIndicatorsForDate(dayItem);

              return (
                <button
                  key={dayIndex}
                  onClick={() => setSelectedDate(dayItem)}
                  className={cn(
                    "min-h-[52px] sm:min-h-[72px] lg:min-h-[82px] p-1.5 sm:p-2 flex flex-col justify-between text-left transition-all relative group focus:outline-hidden",
                    !isCurrentMonthDay && "bg-[#faf9f5]/60 text-slate-400",
                    isCurrentMonthDay && "hover:bg-[#fbfaf6]",
                    isSelected && "bg-amber-50/80 ring-2 ring-amber-500/50 inset-0 z-10",
                    isToday && !isSelected && "bg-blue-50/30"
                  )}
                >
                  {/* Day Number and Today Badge */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={cn(
                        "text-[11px] sm:text-xs font-semibold rounded-md w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center transition-colors",
                        isToday
                          ? "bg-slate-900 text-white font-bold"
                          : isSelected
                          ? "text-amber-900 font-bold"
                          : isCurrentMonthDay
                          ? "text-slate-800"
                          : "text-slate-400"
                      )}
                    >
                      {format(dayItem, "d")}
                    </span>

                    {indicators.totalCount > 0 && (
                      <span className="hidden sm:inline-block text-[10px] text-slate-400 font-medium px-1 rounded-sm bg-slate-100">
                        {indicators.totalCount}
                      </span>
                    )}
                  </div>

                  {/* Visual Activity Dots */}
                  <div className="flex items-center gap-0.5 sm:gap-1 mt-1 sm:mt-1.5 flex-wrap">
                    {indicators.hasAcademicOrMeeting && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-blue-500"
                        title="Fixed Class / Meeting"
                      />
                    )}
                    {indicators.hasDeepWork && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-indigo-600"
                        title="Deep Focus / Assignment"
                      />
                    )}
                    {indicators.hasEcoOrPersonal && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                        title="Habit / Eco-activity"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Calendar Legend */}
      <div className="px-3.5 sm:px-6 py-2 sm:py-2.5 bg-[#fbfaf6] border-t border-[#e6e3da] flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
        <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
          <span className="flex items-center gap-1 sm:gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500" />
            <span>Class / Standup</span>
          </span>
          <span className="flex items-center gap-1 sm:gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-600" />
            <span>Deep Work</span>
          </span>
          <span className="flex items-center gap-1 sm:gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
            <span>Habit / Eco</span>
          </span>
        </div>
        <span className="hidden md:inline-block text-slate-400">
          Selected: {format(selectedDate, "MMM d, yyyy")}
        </span>
      </div>
    </div>
  );
}
