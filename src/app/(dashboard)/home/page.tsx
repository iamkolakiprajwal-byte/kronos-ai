"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Sparkles,
  Sun,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
  ChevronRight,
  Lock,
  Zap,
  GraduationCap,
  Briefcase,
  Compass,
  Check,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { MonthCalendar } from "@/components/calendar/month-calendar";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const {
    role,
    selectedDate,
    setSelectedDate,
    calendarEvents,
    tasks,
    toggleTaskStatus,
    profile,
    referenceDate,
    openQuickTask,
  } = useDemo();

  const todayStr = referenceDate || "2026-11-02";
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

  // Persona-specific suggested schedule blocks
  const studentSuggestedBlocks = [
    {
      id: "sug-s-1",
      title: "ECON 201 Lecture",
      time: "09:00 AM – 10:15 AM",
      days: "Mon, Wed",
      category: "Fixed Class",
      tag: "Academic",
      action: "/my-day",
    },
    {
      id: "sug-s-2",
      title: "CS 106B Lab Session",
      time: "11:00 AM – 12:30 PM",
      days: "Mon, Thu",
      category: "Fixed Lab",
      tag: "Academic",
      action: "/my-day",
    },
    {
      id: "sug-s-3",
      title: "Library Deep Study Block",
      time: "02:00 PM – 03:15 PM",
      days: "Mon – Fri",
      category: "Study Window",
      tag: "Peak Focus",
      action: "/ai",
    },
    {
      id: "sug-s-4",
      title: "Evening Flashcard Recall",
      time: "06:30 PM – 06:45 PM",
      days: "Daily",
      category: "Habit Anchor",
      tag: "Retention",
      action: "/growth?tab=habits",
    },
  ];

  const proSuggestedBlocks = [
    {
      id: "sug-p-1",
      title: "Morning Team Standup",
      time: "09:30 AM – 10:00 AM",
      days: "Mon – Fri",
      category: "Fixed Sync",
      tag: "Engineering",
      action: "/my-day",
    },
    {
      id: "sug-p-2",
      title: "Architecture RFC Deep Work",
      time: "10:30 AM – 12:00 PM",
      days: "Mon, Wed, Fri",
      category: "Deep Code",
      tag: "Focus Window",
      action: "/ai",
    },
    {
      id: "sug-p-3",
      title: "Distributed Cache Review",
      time: "02:00 PM – 03:00 PM",
      days: "Tue, Thu",
      category: "Code Review",
      tag: "Architecture",
      action: "/my-day",
    },
    {
      id: "sug-p-4",
      title: "6 PM Shutdown Boundary",
      time: "06:00 PM – 06:15 PM",
      days: "Daily",
      category: "Work Boundary",
      tag: "Wellbeing",
      action: "/growth?tab=habits",
    },
  ];

  const dualSuggestedBlocks = [
    {
      id: "sug-d-1",
      title: "Synthetix Platform Standup",
      time: "10:00 AM – 10:45 AM",
      days: "Mon – Fri",
      category: "Company Sync",
      tag: "Synthetix AI",
      action: "/my-day",
    },
    {
      id: "sug-d-2",
      title: "Thesis Literature Synthesis",
      time: "02:00 PM – 03:15 PM",
      days: "Mon, Wed",
      category: "Graduate Research",
      tag: "UC Berkeley",
      action: "/ai",
    },
    {
      id: "sug-d-3",
      title: "Berkeley CS 288 Seminar",
      time: "06:00 PM – 07:30 PM",
      days: "Mon, Thu",
      category: "Evening Seminar",
      tag: "Academic",
      action: "/my-day",
    },
    {
      id: "sug-d-4",
      title: "Context Switch Meditation",
      time: "05:45 PM – 06:00 PM",
      days: "Daily",
      category: "Mental Reset",
      tag: "Dual Balance",
      action: "/growth?tab=habits",
    },
  ];

  const suggestedBlocks =
    role === "student"
      ? studentSuggestedBlocks
      : role === "professional"
      ? proSuggestedBlocks
      : dualSuggestedBlocks;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200 pb-16 md:pb-12">
      {/* Editorial Canvas Briefing */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-[#e8e2d5]">
        <div className="space-y-1 sm:space-y-1.5 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-[9px] sm:text-[10px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f2eee6] text-[#687050] border border-[#e4ded2]">
              {isSelectedToday ? "Today's Agenda" : "Inspecting Selected Day"}
            </span>
            <span className="text-[9px] sm:text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-[#f8f6f0] text-[#545049] border border-[#e4ded2]">
              {role === "student" ? "Stanford Junior Year" : role === "professional" ? "CloudScale Sprint 42" : "Synthetix + Berkeley MS"}
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#8a8479]">
              • {profile.planningStyle} rhythm
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#201e1b] tracking-tight">
            {format(selectedDate, "EEEE, MMMM d")}
          </h1>
          <p className="text-xs sm:text-sm text-[#545049] font-sans leading-relaxed max-w-2xl">
            {role === "student"
              ? `${selectedDayEvents.length} fixed classes/labs and ${selectedDayTasks.length} prioritized study blocks balanced around your peak energy hours.`
              : role === "professional"
              ? `${selectedDayEvents.length} stakeholder syncs and ${selectedDayTasks.length} engineering deliverables balanced with protected deep work.`
              : `${selectedDayEvents.length} commitments across job & evening classes, balanced with context transition buffers.`}
          </p>
        </div>

        {/* Quick Workspace Shortcuts (Desktop only; mobile uses primary bottom nav) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Link
            href="/ai"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#f2eee6] text-[#201e1b] border border-[#e8e2d5] text-xs font-medium transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#b37e2a]" />
            <span>AI Assistant</span>
          </Link>
          <Link
            href="/my-day"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] text-xs font-medium shadow-2xs transition-colors"
          >
            <Sun className="w-3.5 h-3.5 text-[#e8decb]" />
            <span>Open My Day</span>
          </Link>
        </div>
      </div>

      {/* TOP & FULL MONTH: Architectural Month Calendar */}
      <section className="space-y-2">
        <MonthCalendar />
      </section>

      {/* Below Calendar: Selected-Day Agenda Timeline + AI Bridge + Suggested Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (7 cols): Selected-Day Agenda & AI Intention Allocator */}
        <div className="lg:col-span-7 space-y-5">
          {/* Selected Date Context Card */}
          <div className="bg-[#fdfcf9] rounded-3xl border border-[#e8e2d5] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d5]">
              <div>
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#8a8479] block">
                  {isSelectedToday ? "Today's Agenda" : "Timeline"}
                </span>
                <h3 className="font-serif text-lg font-normal text-[#201e1b] mt-0.5">
                  {format(selectedDate, "EEEE, MMM d")}
                </h3>
              </div>
              <button
                onClick={openQuickTask}
                className="h-8 px-2.5 rounded-xl bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer text-xs font-medium"
                title="Add task for this date"
              >
                <Plus className="w-3.5 h-3.5 text-[#e8decb]" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Selected Day Items */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {selectedDayEvents.length === 0 && selectedDayTasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8a8479] space-y-2">
                  <CalendarIcon className="w-8 h-8 text-[#d5cdbd] mx-auto" />
                  <p className="font-serif text-sm text-[#545049]">A quiet, unbooked day</p>
                  <p className="text-[11px] text-[#8a8479]">
                    No commitments scheduled. Tap the plus button to add an intention or plan with AI.
                  </p>
                </div>
              ) : (
                <>
                  {/* Fixed Calendar Events (Lectures, Standups) */}
                  {selectedDayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-2xl bg-[#edf2ec]/80 border border-[#d6e0d5] text-xs space-y-1 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-[#201e1b] flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-[#536b54] shrink-0" />
                          {evt.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#536b54] font-semibold shrink-0">
                          {evt.startTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#545049]">
                        <Clock className="w-3 h-3 text-[#536b54] shrink-0" />
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
                        className={cn(
                          "p-3 rounded-2xl border text-xs transition-colors flex items-start gap-2.5",
                          isCompleted
                            ? "bg-[#f5f1e8]/40 border-[#e8e2d5] text-[#8a8479]"
                            : "bg-white border-[#e8e2d5] hover:border-[#d5cdbd] shadow-2xs"
                        )}
                      >
                        <button
                          onClick={() => toggleTaskStatus(t.id)}
                          className="mt-0.5 text-[#8a8479] hover:text-[#536b54] transition-colors shrink-0 cursor-pointer"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-[#536b54] fill-[#edf2ec]" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#d5cdbd]" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={cn(
                                "font-medium truncate",
                                isCompleted ? "line-through text-[#8a8479]" : "text-[#201e1b]"
                              )}
                            >
                              {t.title}
                            </span>
                            <span className="text-[10px] text-[#8a8479] font-mono shrink-0">
                              {t.startTime || `${t.estimatedDuration}m`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {t.priority === "urgent" && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#faece7] text-[#b85437] font-medium border border-[#f3cec3]">
                                Urgent
                              </span>
                            )}
                            {t.tag && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#f2eee6] text-[#545049] border border-[#e4ded2]">
                                {t.tag}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Jump to My Day execution */}
            <div className="pt-2 border-t border-[#e8e2d5]">
              <Link
                href="/my-day"
                className="w-full py-2.5 px-3 rounded-xl bg-[#fbf9f5] hover:bg-[#f2eee6] border border-[#e8e2d5] text-[#201e1b] text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>View Full Daily Timeline</span>
                <ChevronRight className="w-4 h-4 text-[#8a8479]" />
              </Link>
            </div>
          </div>

          {/* Conversational AI Planning Bridge */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#f2eee6]/80 border border-[#e4ded2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white text-[#b37e2a] border border-[#e4ded2] flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
                <Sparkles className="w-4 h-4 text-[#b37e2a]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-[#201e1b]">
                  Adaptive Intention Allocator
                </h3>
                <p className="text-[11px] text-[#545049] leading-relaxed">
                  Tell Kronos your intentions to automatically fit study blocks and tasks around lectures.
                </p>
              </div>
            </div>
            <Link
              href="/ai"
              className="px-3.5 py-2 rounded-xl bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] text-xs font-medium shrink-0 shadow-2xs flex items-center gap-1.5 transition-colors self-end sm:self-auto"
            >
              <span>Plan with AI</span>
              <ArrowRight className="w-3 h-3 text-[#e8decb]" />
            </Link>
          </div>
        </div>

        {/* Right Column (5 cols): Persona Horizon, Suggested Schedule & Upcoming Commitments */}
        <div className="lg:col-span-5 space-y-5">
          {/* Persona Track Horizon Feature Widget */}
          {role === "student" && (
            <div className="bg-[#fdfcf9] rounded-3xl border border-[#e8e2d5] p-5 sm:p-6 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#e8e2d5]">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#536b54]" />
                  <h3 className="font-serif text-base font-normal text-[#201e1b]">Enrolled Courses & Milestones</h3>
                </div>
                <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-[#edf2ec] text-[#536b54] border border-[#d6e0d5]">
                  16 Units
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-white border border-[#e8e2d5] flex items-start justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#201e1b]">CS 106B</span>
                      <span className="text-[10px] text-[#8a8479]">Gates B02</span>
                    </div>
                    <p className="text-[11px] text-[#545049] mt-0.5">Programming Abstractions • Lab Thu</p>
                  </div>
                  <span className="text-[10px] font-medium text-[#b85437] bg-[#faece7] border border-[#f3cec3] px-2 py-0.5 rounded-md whitespace-nowrap">
                    Midterm: 12d
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#e8e2d5] flex items-start justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#201e1b]">ECON 201</span>
                      <span className="text-[10px] text-[#8a8479]">Cubberley 110</span>
                    </div>
                    <p className="text-[11px] text-[#545049] mt-0.5">Intermediate Micro • Prof. Duggan</p>
                  </div>
                  <span className="text-[10px] font-medium text-[#b37e2a] bg-[#fbf5e7] border border-[#f4e2ba] px-2 py-0.5 rounded-md whitespace-nowrap">
                    P-Set 3: Fri
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#e8e2d5] flex items-start justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#201e1b]">STATS 116</span>
                      <span className="text-[10px] text-[#8a8479]">Hewlett 200</span>
                    </div>
                    <p className="text-[11px] text-[#545049] mt-0.5">Theory of Probability • Diaconis</p>
                  </div>
                  <span className="text-[10px] font-medium text-[#536b54] bg-[#edf2ec] border border-[#d6e0d5] px-2 py-0.5 rounded-md whitespace-nowrap">
                    Quiz 2: Wed
                  </span>
                </div>
              </div>

              <div className="pt-1 text-[11px] text-[#8a8479] flex items-center justify-between border-t border-[#f2eee6]">
                <span>Target Term GPA: 3.85</span>
                <span className="font-mono text-[10px]">Stanford Junior Year</span>
              </div>
            </div>
          )}

          {role === "professional" && (
            <div className="bg-[#fdfcf9] rounded-3xl border border-[#e8e2d5] p-5 sm:p-6 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#e8e2d5]">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#b85437]" />
                  <h3 className="font-serif text-base font-normal text-[#201e1b]">Sprint 42 Capacity & Flow</h3>
                </div>
                <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-[#faece7] text-[#b85437] border border-[#f3cec3]">
                  Platform Rel
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-white border border-[#e8e2d5] shadow-2xs">
                  <span className="text-[10px] text-[#8a8479] font-medium uppercase tracking-wider block">Meeting Load</span>
                  <span className="text-lg font-serif font-semibold text-[#201e1b] mt-0.5 block">3.5 hrs</span>
                  <span className="text-[10px] text-[#b85437]">3 syncs scheduled</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-[#e8e2d5] shadow-2xs">
                  <span className="text-[10px] text-[#8a8479] font-medium uppercase tracking-wider block">Deep Work Flow</span>
                  <span className="text-lg font-serif font-semibold text-[#536b54] mt-0.5 block">4.5 hrs</span>
                  <span className="text-[10px] text-[#536b54]">62% ratio (optimal)</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="p-2.5 rounded-xl bg-white border border-[#e8e2d5] text-xs flex items-center justify-between shadow-2xs">
                  <span className="font-medium text-[#201e1b] truncate">Distributed Cache RFC</span>
                  <span className="text-[10px] text-[#b37e2a] font-mono shrink-0">Review Due 5 PM</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#e8e2d5] text-xs flex items-center justify-between shadow-2xs">
                  <span className="font-medium text-[#201e1b] truncate">Raft Consensus Benchmark</span>
                  <span className="text-[10px] text-[#536b54] font-mono shrink-0">In Progress</span>
                </div>
              </div>

              <div className="pt-1 text-[11px] text-[#8a8479] flex items-center justify-between border-t border-[#f2eee6]">
                <span>Hard Shutdown: 6:00 PM</span>
                <span className="font-mono text-[10px]">CloudScale Systems</span>
              </div>
            </div>
          )}

          {role === "both" && (
            <div className="bg-[#fdfcf9] rounded-3xl border border-[#e8e2d5] p-5 sm:p-6 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#e8e2d5]">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#687050]" />
                  <h3 className="font-serif text-base font-normal text-[#201e1b]">Work-Study Allocation Split</h3>
                </div>
                <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-[#f1f3ea] text-[#687050] border border-[#dce1d4]">
                  Dual Track
                </span>
              </div>

              {/* Split progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-medium text-[#545049]">
                  <span>Synthetix Eng: 4.5h (55%)</span>
                  <span>Berkeley MS: 3.5h (45%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e8e2d5] overflow-hidden flex">
                  <div className="h-full bg-[#201e1b]" style={{ width: "55%" }} title="Work 55%" />
                  <div className="h-full bg-[#536b54]" style={{ width: "45%" }} title="Study 45%" />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#edf2ec] border border-[#d6e0d5] text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#536b54]">
                  <Check className="w-3.5 h-3.5" />
                  <span>Zero Schedule Collisions</span>
                </div>
                <p className="text-[11px] text-[#545049]">
                  10 AM Synthetix demo and 6 PM Berkeley seminar are buffered by a 45-minute mental transition.
                </p>
              </div>

              <div className="pt-1 text-[11px] text-[#8a8479] flex items-center justify-between border-t border-[#f2eee6]">
                <span>Context Switches: 2 Planned</span>
                <span className="font-mono text-[10px]">Synthetix + Berkeley</span>
              </div>
            </div>
          )}

          {/* Horizontally Browsable Suggested Activities (Regain Pattern) */}
          <div className="bg-[#fdfcf9] rounded-3xl border border-[#e8e2d5] p-5 sm:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e8e2d5]">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#201e1b] uppercase tracking-wider font-sans">
                  Suggested Schedule
                </span>
                <span className="text-[10px] text-[#8a8479]">• Peak Rhythm</span>
              </div>
              <Link
                href="/ai"
                className="text-[11px] text-[#536b54] font-medium hover:underline flex items-center gap-1"
              >
                <span>Optimize</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Horizontally scrollable cards with snap */}
            <div className="flex gap-2.5 overflow-x-auto snap-x scrollbar-none pb-2 -mx-2 px-2">
              {suggestedBlocks.map((block) => (
                <Link
                  key={block.id}
                  href={block.action}
                  className="min-w-[210px] max-w-[230px] snap-start p-3.5 rounded-2xl bg-white hover:bg-[#fdfcf9] border border-[#e8e2d5] hover:border-[#d5cdbd] transition-all shadow-2xs flex flex-col justify-between shrink-0 group cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#8a8479]">
                      <span className="font-medium text-[#687050] uppercase tracking-wider">
                        {block.category}
                      </span>
                      <span>{block.days}</span>
                    </div>
                    <h4 className="font-serif text-sm font-normal text-[#201e1b] group-hover:text-[#536b54] transition-colors truncate">
                      {block.title}
                    </h4>
                    <p className="text-[11px] text-[#545049] flex items-center gap-1.5 font-mono">
                      <Clock className="w-3 h-3 text-[#8a8479]" />
                      <span>{block.time}</span>
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#f2eee6] flex items-center justify-between">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#f2eee6] text-[#545049] font-medium">
                      {block.tag}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-[#f2eee6] group-hover:bg-[#201e1b] group-hover:text-white text-[#201e1b] flex items-center justify-center transition-colors text-xs font-semibold">
                      +
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Subtle Pagination Dot Indicators */}
            <div className="flex items-center justify-center gap-1 pt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#201e1b]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#d5cdbd]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#d5cdbd]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#d5cdbd]" />
            </div>
          </div>

          {/* Upcoming Commitments Card */}
          <div className="bg-[#fdfcf9] rounded-3xl border border-[#e8e2d5] p-5 sm:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e8e2d5]">
              <h3 className="font-serif text-base font-normal text-[#201e1b] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#687050]" />
                <span>Upcoming Commitments</span>
              </h3>
              <span className="text-[10px] text-[#8a8479] font-medium">Next 7 Days</span>
            </div>

            <div className="space-y-2">
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-[#8a8479] py-3 text-center">No upcoming events scheduled.</p>
              ) : (
                upcomingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedDate(new Date(evt.date))}
                    className="p-3 rounded-2xl bg-white hover:bg-[#f2eee6]/60 border border-[#e8e2d5] text-xs cursor-pointer transition-colors shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium text-[#201e1b] truncate">{evt.title}</span>
                      <span className="text-[10px] font-semibold text-[#687050] bg-[#f1f3ea] px-2 py-0.5 rounded-full border border-[#dce1d4] shrink-0">
                        {evt.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#545049]">
                      <Clock className="w-3 h-3 text-[#8a8479]" />
                      <span>{evt.startTime} – {evt.endTime}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
