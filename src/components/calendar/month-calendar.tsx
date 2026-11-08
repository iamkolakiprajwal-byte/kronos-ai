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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { DEMO_REFERENCE_DATE } from "@/lib/mock/demo-data";
import { cn } from "@/lib/utils";

export function MonthCalendar() {
  const { selectedDate, setSelectedDate, calendarEvents, tasks } = useDemo();
  const [todayDate, setTodayDate] = useState<Date>(() => new Date("2026-11-08T00:00:00"));
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date("2026-11-08T00:00:00")));
  const [mobileView, setMobileView] = useState<"week" | "month">("month");

  React.useEffect(() => {
    const now = new Date();
    setTodayDate(now);
    setCurrentMonth(startOfMonth(selectedDate || now));
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
    const now = new Date();
    setTodayDate(now);
    setCurrentMonth(startOfMonth(now));
    setSelectedDate(now);
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
    <div className="bg-[#fdfcf9] rounded-3xl border border-[#e8e2d5] shadow-2xs overflow-hidden transition-all">
      {/* Calendar Header with Navigation */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#e8e2d5] bg-[#fbf9f5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Title and Mobile Quick Controls */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#f2eee6] text-[#201e1b] border border-[#e4ded2] flex items-center justify-center shrink-0 shadow-2xs">
              <CalendarIcon className="w-4 h-4 text-[#687050]" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-2xl font-normal text-[#201e1b] tracking-tight whitespace-nowrap">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <p className="text-[11px] text-[#8a8479] hidden sm:block">
                Interactive Planning Surface • Select any day to inspect commitments
              </p>
            </div>
          </div>

          {/* Mobile Quick Navigator: Today + Prev/Next (never squeezes month name) */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0">
            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-[11px] font-medium text-[#545049] hover:text-[#201e1b] hover:bg-[#f2eee6] rounded-xl transition-colors border border-[#e8e2d5] shadow-2xs cursor-pointer"
            >
              Today
            </button>
            <div className="flex items-center border border-[#e8e2d5] rounded-xl bg-white shadow-2xs overflow-hidden">
              <button
                onClick={prevPeriod}
                className="p-1.5 hover:bg-[#f2eee6] text-[#545049] hover:text-[#201e1b] transition-colors cursor-pointer"
                aria-label="Previous period"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-3.5 bg-[#e8e2d5]" />
              <button
                onClick={nextPeriod}
                className="p-1.5 hover:bg-[#f2eee6] text-[#545049] hover:text-[#201e1b] transition-colors cursor-pointer"
                aria-label="Next period"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* View Switcher and Desktop Navigator Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-[#f0eae0]">
          {/* Week / Month Toggle */}
          <div className="flex items-center p-0.5 bg-[#f2eee6] rounded-xl border border-[#e4ded2] w-full sm:w-auto">
            <button
              onClick={() => setMobileView("week")}
              className={cn(
                "flex-1 sm:flex-initial px-3.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer text-center",
                mobileView === "week"
                  ? "bg-white text-[#201e1b] shadow-2xs font-semibold"
                  : "text-[#8a8479] hover:text-[#201e1b]"
              )}
            >
              Week View
            </button>
            <button
              onClick={() => setMobileView("month")}
              className={cn(
                "flex-1 sm:flex-initial px-3.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer text-center",
                mobileView === "month"
                  ? "bg-white text-[#201e1b] shadow-2xs font-semibold"
                  : "text-[#8a8479] hover:text-[#201e1b]"
              )}
            >
              Full Month
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-medium text-[#545049] hover:text-[#201e1b] hover:bg-[#f2eee6] rounded-xl transition-colors border border-[#e8e2d5] cursor-pointer shadow-2xs"
            >
              Today
            </button>
            <div className="flex items-center border border-[#e8e2d5] rounded-xl bg-white shadow-2xs overflow-hidden">
              <button
                onClick={prevPeriod}
                className="p-1.5 hover:bg-[#f2eee6] text-[#545049] hover:text-[#201e1b] transition-colors cursor-pointer"
                aria-label="Previous period"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-4 bg-[#e8e2d5]" />
              <button
                onClick={nextPeriod}
                className="p-1.5 hover:bg-[#f2eee6] text-[#545049] hover:text-[#201e1b] transition-colors cursor-pointer"
                aria-label="Next period"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-[#e8e2d5] bg-[#faf8f4] text-center">
        {weekDayNames.map((d, i) => (
          <div
            key={d.full}
            className={cn(
              "py-2 sm:py-2.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider",
              i === 0 || i === 6 ? "text-[#a39c8e]" : "text-[#6d665b]"
            )}
          >
            <span className="sm:hidden">{d.short}</span>
            <span className="hidden sm:inline">{d.full}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="divide-y divide-[#f0eae0]">
        {(mobileView === "week" ? [activeWeekRow] : rows).map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-7 divide-x divide-[#f0eae0]">
            {row.map((dayItem, dayIndex) => {
              const dayItemStr = format(dayItem, "yyyy-MM-dd");
              const todayStr = format(todayDate, "yyyy-MM-dd");
              const selectedStr = format(selectedDate, "yyyy-MM-dd");

              const isSelected = dayItemStr === selectedStr || isSameDay(dayItem, selectedDate);
              const isToday = dayItemStr === todayStr || isSameDay(dayItem, todayDate);
              const isCurrentMonthDay = isSameMonth(dayItem, currentMonth);
              const indicators = getIndicatorsForDate(dayItem);

              return (
                <button
                  key={dayIndex}
                  onClick={() => setSelectedDate(dayItem)}
                  className={cn(
                    "min-h-[54px] sm:min-h-[74px] lg:min-h-[84px] p-1.5 sm:p-2.5 flex flex-col justify-between text-left transition-all relative group focus:outline-hidden cursor-pointer",
                    !isCurrentMonthDay && "bg-[#fbf9f5]/50 text-[#b5ad9e]",
                    isCurrentMonthDay && "hover:bg-[#f7f4ee]",
                    isToday && !isSelected && "bg-[#f5f8f3] border-t-2 border-t-[#536b54] ring-1 ring-[#536b54]/30 shadow-2xs",
                    isSelected && "bg-[#faece7]/90 ring-2 ring-[#b85437] z-10",
                    isToday && isSelected && "border-t-2 border-t-[#b85437]"
                  )}
                >
                  {/* Day Number and Count Pill */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "text-[11px] sm:text-xs font-sans rounded-full w-6 h-6 flex items-center justify-center transition-all",
                          isToday && isSelected
                            ? "bg-[#201e1b] text-white font-bold ring-2 ring-[#b85437] shadow-xs"
                            : isToday
                            ? "bg-[#201e1b] text-white font-bold shadow-xs"
                            : isSelected
                            ? "bg-[#b85437] text-white font-semibold shadow-2xs"
                            : isCurrentMonthDay
                            ? "text-[#201e1b] font-medium"
                            : "text-[#b5ad9e]"
                        )}
                      >
                        {format(dayItem, "d")}
                      </span>
                      {isToday && (
                        <span className="inline-block text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#536b54] text-white shadow-2xs">
                          Today
                        </span>
                      )}
                    </div>

                    {indicators.totalCount > 0 && (
                      <span className="hidden sm:inline-block text-[9px] text-[#545049] font-medium px-1.5 py-0.5 rounded-md bg-[#f2eee6] border border-[#e4ded2]">
                        {indicators.totalCount}
                      </span>
                    )}
                  </div>

                  {/* Visual Activity Dots (Muted Sage, Terracotta, Olive) */}
                  <div className="flex items-center gap-1 mt-1 sm:mt-1.5 flex-wrap">
                    {indicators.hasAcademicOrMeeting && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#536b54]"
                        title="Fixed Class / Lecture"
                      />
                    )}
                    {indicators.hasDeepWork && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#b85437]"
                        title="Deep Focus Session"
                      />
                    )}
                    {indicators.hasEcoOrPersonal && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#687050]"
                        title="Habit / Eco-action"
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
      <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#faf8f4] border-t border-[#e8e2d5] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] sm:text-[11px] text-[#8a8479]">
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#536b54]" />
            <span className="text-[#545049]">Class / Lecture</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#b85437]" />
            <span className="text-[#545049]">Deep Work</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#687050]" />
            <span className="text-[#545049]">Habit / Eco</span>
          </span>
        </div>
        <span className="text-[#8a8479] font-medium text-[10px] sm:text-[11px]">
          Viewing: {format(selectedDate, "MMM d, yyyy")}
        </span>
      </div>
    </div>
  );
}
