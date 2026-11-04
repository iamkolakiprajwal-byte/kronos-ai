"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { MonthCalendar } from "@/components/calendar/month-calendar";
import { useDemo } from "@/context/demo-context";
import {
  Calendar as CalendarIcon,
  Sparkles,
  ArrowRight,
  Clock,
  Plus,
  Lock,
  CheckCircle2,
  Circle,
  ChevronRight,
  Sun,
} from "lucide-react";
import { QuickTaskModal } from "@/components/dashboard/quick-task-modal";

export default function HomePage() {
  const {
    profile,
    calendarEvents,
    tasks,
    selectedDate,
    setSelectedDate,
    toggleTaskStatus,
  } = useDemo();

  const [todayStr, setTodayStr] = useState("2026-11-02");
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);

  useEffect(() => {
    setTodayStr(format(new Date(), "yyyy-MM-dd"));
  }, []);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const isSelectedToday = selectedDateStr === todayStr;

  // Tasks and events for selected day
  const selectedDayTasks = tasks.filter((t) => t.scheduledDate === selectedDateStr);
  const selectedDayEvents = calendarEvents.filter((e) => e.date === selectedDateStr);

  // Upcoming commitments across future days
  const upcomingEvents = calendarEvents
    .filter((e) => e.date > todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Workspace Banner */}
      <div className="bg-white rounded-2xl border border-[#e6e3da] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-200 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Calendar Overview
              </h1>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80">
                {profile.planningStyle} style
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {profile.name} • {profile.institutionOrCompany} • Select any date to inspect and plan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <Link
            href="/ai"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Planning Assistant</span>
          </Link>
          <Link
            href="/my-day"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span>Open My Day</span>
          </Link>
        </div>
      </div>

      {/* Primary Layout: Calendar Hero + Contextual Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Calendar Workspace Hero */}
        <div className="lg:col-span-8 space-y-4">
          <MonthCalendar />

          {/* Quick AI Schedule Callout */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-amber-700" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900">
                  Adaptive Time Allocator
                </h4>
                <p className="text-[11px] text-slate-600 truncate">
                  Tell AI your intentions to automatically fit study blocks and tasks around fixed lectures.
                </p>
              </div>
            </div>
            <Link
              href="/ai"
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 shadow-xs flex items-center gap-1 transition-colors"
            >
              <span>Plan with AI</span>
              <ArrowRight className="w-3 h-3 text-amber-300" />
            </Link>
          </div>
        </div>

        {/* Right 4 Cols: Selected-Day Agenda & Upcoming Commitments */}
        <div className="lg:col-span-4 space-y-5">
          {/* Selected Date Context Card */}
          <div className="bg-white rounded-2xl border border-[#e6e3da] p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {isSelectedToday ? "Today's Agenda" : "Selected Date"}
                </span>
                <h3 className="font-serif text-base font-bold text-slate-900 mt-0.5">
                  {format(selectedDate, "EEEE, MMMM d")}
                </h3>
              </div>
              <button
                onClick={() => setIsQuickTaskOpen(true)}
                className="p-1.5 rounded-lg bg-[#f5f3ec] hover:bg-[#ede9df] text-slate-800 transition-colors"
                title="Add task for this date"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Day Items */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto">
              {selectedDayEvents.length === 0 && selectedDayTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No commitments or tasks placed on this day.
                </div>
              ) : (
                <>
                  {/* Fixed Calendar Events */}
                  {selectedDayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-blue-950 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-blue-700 shrink-0" />
                          {evt.title}
                        </span>
                        <span className="text-[10px] font-mono text-blue-800 shrink-0 font-medium">
                          {evt.startTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-blue-800/80">
                        <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>{evt.startTime} – {evt.endTime}</span>
                        {evt.location && <span className="truncate">• {evt.location}</span>}
                      </div>
                    </div>
                  ))}

                  {/* Tasks */}
                  {selectedDayTasks.map((t) => {
                    const isCompleted = t.status === "completed";
                    return (
                      <div
                        key={t.id}
                        className={`p-2.5 rounded-xl border text-xs transition-colors flex items-start gap-2.5 ${
                          isCompleted
                            ? "bg-[#faf9f6] border-[#e6e3da] text-slate-400"
                            : "bg-[#fdfcf9] border-[#e6e3da] hover:border-slate-300"
                        }`}
                      >
                        <button
                          onClick={() => toggleTaskStatus(t.id)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-600 shrink-0"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`font-semibold truncate ${
                                isCompleted ? "line-through text-slate-400" : "text-slate-900"
                              }`}
                            >
                              {t.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0">
                              {t.startTime || `${t.estimatedDuration}m`}
                            </span>
                          </div>
                          {t.tag && (
                            <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200 mt-1">
                              {t.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Jump to My Day execution */}
            <div className="pt-2 border-t border-[#f0ede6]">
              <Link
                href="/my-day"
                className="w-full py-2 px-3 rounded-xl bg-[#faf9f6] hover:bg-slate-100 border border-[#e6e3da] text-slate-700 text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <span>View Full Daily Timeline</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Upcoming Commitments Card */}
          <div className="bg-white rounded-2xl border border-[#e6e3da] p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0ede6]">
              <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Upcoming Milestones</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Next 7 Days</span>
            </div>

            <div className="space-y-2">
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No upcoming events scheduled.</p>
              ) : (
                upcomingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedDate(new Date(evt.date))}
                    className="p-2.5 rounded-xl bg-[#faf9f6] hover:bg-amber-50/40 border border-[#e6e3da] text-xs cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-slate-900 truncate">{evt.title}</span>
                      <span className="text-[10px] font-semibold text-amber-900 bg-amber-100/70 px-1.5 py-0.5 rounded-sm shrink-0">
                        {evt.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{evt.startTime} – {evt.endTime}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <QuickTaskModal
        isOpen={isQuickTaskOpen}
        onClose={() => setIsQuickTaskOpen(false)}
      />
    </div>
  );
}
