"use client";

import React from "react";
import { MonthCalendar } from "@/components/calendar/month-calendar";
import { DailyAgenda } from "@/components/dashboard/daily-agenda";
import { AssistantInput } from "@/components/ai-chat/assistant-input";
import { useDemo } from "@/context/demo-context";
import { Calendar, ArrowRight, ShieldCheck, Sparkles, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function HomePage() {
  const { profile, calendarEvents, goals, habits, selectedDate } = useDemo();
  const [todayStr, setTodayStr] = React.useState("2026-11-02");

  React.useEffect(() => {
    setTodayStr(format(new Date(), "yyyy-MM-dd"));
  }, []);

  // Upcoming events in next 7 days (excluding today)
  const upcomingEvents = calendarEvents.filter((e) => e.date > todayStr).slice(0, 3);

  return (
    <div className="space-y-4 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Top Banner: Planner Intent Note */}
      <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-800" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-serif">
              Personalized Planning Surface
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed">
              Active profile: <span className="font-semibold text-slate-900">{profile.name}</span> ({profile.headline}).
              <span className="hidden sm:inline"> Click any date to view and adapt your agenda.</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <div className="text-left md:text-right">
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-800">
              Focus Style: <span className="capitalize">{profile.planningStyle}</span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-500">
              {profile.preferredFocusDuration}m work / {profile.preferredBreakDuration}m rest
            </div>
          </div>
        </div>
      </div>

      {/* 1. Prominent Monthly Calendar near the top */}
      <section>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Monthly Planner View
          </h2>
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:inline">
            Visual activity markers reflect fixed classes, study sessions & habits
          </span>
        </div>
        <MonthCalendar />
      </section>

      {/* 2. Today's Agenda & Upcoming Commitments Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 items-start">
        {/* Left 2 Cols: Daily Agenda & Task Breakdown */}
        <div className="lg:col-span-2">
          <DailyAgenda />
        </div>

        {/* Right 1 Col: Upcoming Commitments & Habit Pulse */}
        <div className="space-y-4 sm:space-y-6">
          {/* Upcoming Schedule Card */}
          <div className="bg-white rounded-2xl border border-[#e6e3da] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Upcoming Commitments
              </h3>
              <Link
                href="/plan"
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                <span>Full Plan</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">No upcoming commitments scheduled.</p>
              ) : (
                upcomingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 sm:p-3 rounded-xl bg-[#faf9f6] border border-[#e6e3da]/80 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-900">{evt.title}</span>
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded-sm shrink-0">
                        {evt.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] sm:text-[11px] text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{evt.startTime} - {evt.endTime}</span>
                      {evt.location && (
                        <>
                          <span>•</span>
                          <span className="truncate">{evt.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Goals Snapshot */}
          <div className="bg-white rounded-2xl border border-[#e6e3da] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Active Goals
              </h3>
              <Link
                href="/goals"
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                <span>Roadmap</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {goals.slice(0, 2).map((goal) => (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 truncate">{goal.title}</span>
                    <span className="font-bold text-slate-900">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-[#f0ede6] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-900 h-full rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. AI Assistant Chat Dock at bottom of main content */}
      <section>
        <AssistantInput />
      </section>
    </div>
  );
}
