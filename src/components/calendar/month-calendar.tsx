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
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { cn } from "@/lib/utils";

export function MonthCalendar() {
  const { selectedDate, setSelectedDate, calendarEvents, tasks } = useDemo();
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date("2026-11-02T00:00:00"));
  const [todayDate, setTodayDate] = useState<Date>(() => new Date("2026-11-02T00:00:00"));

  React.useEffect(() => {
    const now = new Date();
    setTodayDate(now);
    setCurrentMonth(now);
  }, []);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
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
    const hasDeepWork = dayEvents.some((e) => e.category === "deep_work") || dayTasks.some((t) => t.priority === "urgent" || t.priority === "high");
    const hasEcoOrPersonal = dayEvents.some((e) => e.category === "eco" || e.category === "personal") || dayTasks.some((t) => t.category === "sustainability" || t.category === "personal");

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

  const weekDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-2xl border border-[#e6e3da] shadow-xs overflow-hidden">
      {/* Calendar Header with Navigation */}
      <div className="px-6 py-4 border-b border-[#e6e3da] flex items-center justify-between bg-[#fdfcf9]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-900 tracking-tight">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <p className="text-xs text-slate-500">
              Interactive Planner Surface • Select a date to view agenda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={goToToday}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-[#f0ede6] rounded-md transition-colors border border-[#e6e3da]"
          >
            Today
          </button>
          <div className="flex items-center border border-[#e6e3da] rounded-md bg-white">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-[#f5f3ec] text-slate-600 rounded-l-md transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-[#e6e3da]" />
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-[#f5f3ec] text-slate-600 rounded-r-md transition-colors"
              aria-label="Next month"
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
            key={d}
            className={cn(
              "py-2.5 text-[11px] font-semibold uppercase tracking-wider",
              i === 0 || i === 6 ? "text-slate-400" : "text-slate-600"
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="divide-y divide-[#f0ede6]">
        {rows.map((row, rowIndex) => (
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
                    "min-h-[72px] sm:min-h-[82px] p-2 flex flex-col justify-between text-left transition-all relative group focus:outline-hidden",
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
                        "text-xs font-semibold rounded-md w-6 h-6 flex items-center justify-center transition-colors",
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
                      <span className="text-[10px] text-slate-400 font-medium px-1 rounded-sm bg-slate-100">
                        {indicators.totalCount}
                      </span>
                    )}
                  </div>

                  {/* Visual Activity Dots */}
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
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
      <div className="px-6 py-2.5 bg-[#fbfaf6] border-t border-[#e6e3da] flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Class / Standup (Fixed)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span>Deep Work / Study</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Habit / Sustainability</span>
          </span>
        </div>
        <span className="hidden sm:inline-block text-slate-400">
          Selected: {format(selectedDate, "MMM d, yyyy")}
        </span>
      </div>
    </div>
  );
}
