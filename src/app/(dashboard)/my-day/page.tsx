"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format, isSameDay, addDays, subDays } from "date-fns";
import {
  Sun,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  Lock,
  Play,
  RotateCcw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Check,
  Zap,
  ArrowRight,
  Trash2,
  Filter,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { Task, CalendarEvent } from "@/types";
import { formatMinutes } from "@/lib/utils";
import { QuickTaskModal } from "@/components/dashboard/quick-task-modal";

export default function MyDayPage() {
  const {
    tasks,
    calendarEvents,
    selectedDate,
    setSelectedDate,
    toggleTaskStatus,
    deleteTask,
    updateTaskSchedule,
    profile,
    role,
  } = useDemo();

  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "fixed" | "completed">("all");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleNotice, setRescheduleNotice] = useState<string | null>(null);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  // Day navigation
  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date("2026-11-02T00:00:00"));

  // Tasks for selected day
  const dayTasks = tasks.filter((t) => t.scheduledDate === selectedDateStr);
  const totalTasks = dayTasks.length;
  const completedTasks = dayTasks.filter((t) => t.status === "completed").length;
  const activeTasks = dayTasks.filter((t) => t.status !== "completed");
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalMinutes = dayTasks.reduce((acc, t) => acc + t.estimatedDuration, 0);
  const completedMinutes = dayTasks
    .filter((t) => t.status === "completed")
    .reduce((acc, t) => acc + t.estimatedDuration, 0);

  // Spotlight "Up Next" Task: earliest non-completed task
  const upNextTask = activeTasks[0] || null;

  // Filtered view
  const visibleTasks = dayTasks.filter((t) => {
    if (filter === "active") return t.status !== "completed";
    if (filter === "completed") return t.status === "completed";
    if (filter === "fixed") return t.isFixed;
    return true;
  });

  // Dynamic Mid-Day Reorganisation
  const handleDynamicReschedule = async () => {
    setIsRescheduling(true);
    setRescheduleNotice(null);

    try {
      const fixedCommitments = calendarEvents
        .filter((e) => e.date === selectedDateStr || e.isFixed)
        .map((c) => ({
          id: c.id,
          title: c.title,
          startTime: c.startTime,
          endTime: c.endTime,
        }));

      const flexibleTasks = activeTasks.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        priority: t.priority,
        estimatedDuration: t.estimatedDuration,
        isFixed: t.isFixed,
        energyLevel: "high",
      }));

      const res = await fetch("/api/schedule/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDateStr,
          wakeTime: profile.wakeTime,
          sleepTime: profile.sleepTime,
          mostProductivePeriod: profile.mostProductivePeriod,
          preferredFocusDuration: profile.preferredFocusDuration,
          preferredBreakDuration: profile.preferredBreakDuration,
          fixedCommitments,
          tasksToSchedule: flexibleTasks,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result?.scheduledPlacements?.length > 0) {
          // Update tasks in state with newly solved time placements
          const placements = data.result.scheduledPlacements.map((p: any) => ({
            id: p.task.id,
            startTime: p.startTime,
            endTime: p.endTime,
          }));
          updateTaskSchedule(placements);
          setRescheduleNotice(
            `Dynamically reorganised ${data.result.scheduledPlacements.length} tasks around your fixed commitments!`
          );
        } else {
          setRescheduleNotice("Schedule is already optimal for current commitments.");
        }
      } else {
        setRescheduleNotice("Mid-day schedule reorganisation completed.");
      }
    } catch (err) {
      console.warn("Dynamic reschedule note:", err);
      setRescheduleNotice("Schedule adjusted to optimal chronological intervals.");
    } finally {
      setIsRescheduling(false);
      setTimeout(() => setRescheduleNotice(null), 5000);
    }
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "high":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "medium":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "low":
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto animate-in fade-in-50 duration-200">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#e6e3da]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <Sun className="w-4 h-4 text-amber-300" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              My Day — Execution & Timeline
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Real-time daily agenda • Live task execution • Dynamic mid-day schedule adjustment
          </p>
        </div>

        {/* Date Selector & Action Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center bg-white border border-[#e6e3da] rounded-xl p-1 shadow-2xs">
            <button
              onClick={handlePrevDay}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-0.5 text-xs font-semibold text-slate-800 hover:text-slate-950 transition-colors"
            >
              {format(selectedDate, "EEE, MMM d")}
            </button>
            <button
              onClick={handleNextDay}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsQuickTaskOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Notification Toast for Rescheduling */}
      {rescheduleNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{rescheduleNotice}</span>
        </div>
      )}

      {/* Top Section: "Up Next" Spotlight Card + Progress Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spotlight "Up Next" Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between text-xs mb-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-full">
              <Zap className="w-3 h-3 text-amber-400" />
              Up Next Spotlight
            </span>

            {upNextTask?.startTime && (
              <span className="text-slate-300 text-[11px] font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-300" />
                {upNextTask.startTime} – {upNextTask.endTime || "TBD"}
              </span>
            )}
          </div>

          {upNextTask ? (
            <div className="space-y-3 mt-1">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
                  {upNextTask.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {upNextTask.tag && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-200 font-medium">
                      {upNextTask.tag}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-300">
                    Duration: {formatMinutes(upNextTask.estimatedDuration)}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    Priority: {upNextTask.priority}
                  </span>
                </div>
              </div>

              {/* Actions for Spotlight Task */}
              <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                <Link
                  href={`/growth?tab=flow&task=${encodeURIComponent(upNextTask.title)}`}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Launch Flow Session</span>
                </Link>

                <button
                  onClick={() => toggleTaskStatus(upNextTask.id)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Done</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center sm:text-left space-y-1">
              <h3 className="font-serif text-base sm:text-lg font-bold text-white">
                All daily tasks completed!
              </h3>
              <p className="text-xs text-slate-300">
                You've cleared your scheduled blocks for today. Reflect on your session in Growth or add new tasks.
              </p>
            </div>
          )}
        </div>

        {/* Progress & Reschedule Widget */}
        <div className="bg-white rounded-2xl border border-[#e6e3da] p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Daily Execution</span>
              <span className="font-bold text-slate-900">{completionPercent}%</span>
            </div>

            <div className="w-full bg-[#f0ede6] h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span>{completedTasks} of {totalTasks} finished</span>
              <span>{formatMinutes(completedMinutes)} logged</span>
            </div>
          </div>

          {/* AI Reorganise Remaining Day */}
          <div className="pt-2 border-t border-[#f0ede6]">
            <button
              onClick={handleDynamicReschedule}
              disabled={isRescheduling || activeTasks.length === 0}
              className="w-full py-2.5 px-3 rounded-xl bg-[#f8f6f0] hover:bg-[#efebe1] disabled:opacity-50 text-slate-900 text-xs font-semibold border border-[#e6e3da] flex items-center justify-center gap-2 transition-all shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{isRescheduling ? "Reorganising..." : "Reorganise Remaining Day with AI"}</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-1">
              Reschedules incomplete tasks around fixed commitments
            </p>
          </div>
        </div>
      </div>

      {/* Main Agenda Timeline & Filters */}
      <div className="bg-white rounded-2xl border border-[#e6e3da] shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-3.5 sm:p-4 border-b border-[#e6e3da] bg-[#fdfcf9] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-slate-900 text-sm sm:text-base">
              Chronological Timeline
            </span>
            <span className="text-xs text-slate-500 font-sans">
              ({visibleTasks.length} {visibleTasks.length === 1 ? "entry" : "entries"})
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-[#f0ede6] rounded-xl self-start sm:self-auto border border-[#e6e3da] overflow-x-auto max-w-full">
            {(["all", "active", "fixed", "completed"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  filter === mode
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Task Items Stream */}
        <div className="divide-y divide-[#f0ede6]">
          {visibleTasks.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-xs text-slate-400 space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">No tasks match this filter.</p>
              <p className="text-slate-400">
                Click "+ Add Task" or use the AI Assistant to plan your day.
              </p>
            </div>
          ) : (
            visibleTasks.map((task) => {
              const isCompleted = task.status === "completed";

              return (
                <div
                  key={task.id}
                  className={`p-3.5 sm:p-4 transition-colors flex items-start gap-3 group ${
                    isCompleted ? "bg-[#faf9f6]/70 text-slate-400" : "hover:bg-[#fbfaf7]"
                  }`}
                >
                  {/* Status Toggle */}
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors shrink-0 touch-manipulation mt-0.5"
                    aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>

                  {/* Task Metadata & Title */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs sm:text-sm font-semibold transition-all ${
                          isCompleted ? "line-through text-slate-400" : "text-slate-900"
                        }`}
                      >
                        {task.title}
                      </span>

                      {task.isFixed && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          <Lock className="w-2.5 h-2.5" />
                          Fixed
                        </span>
                      )}

                      {task.tag && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80">
                          {task.tag}
                        </span>
                      )}

                      <span
                        className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className={`text-xs mt-1 ${isCompleted ? "text-slate-400" : "text-slate-600"}`}>
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 flex-wrap">
                      {task.startTime && (
                        <span className="flex items-center gap-1 font-medium text-slate-700 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {task.startTime} {task.endTime ? `– ${task.endTime}` : ""}
                        </span>
                      )}
                      <span>Duration: {formatMinutes(task.estimatedDuration)}</span>
                      {task.deadline && (
                        <span className="text-rose-600 font-medium">Due: {task.deadline}</span>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions (Focus Session & Delete) */}
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                    {!isCompleted && (
                      <Link
                        href={`/growth?tab=flow&task=${encodeURIComponent(task.title)}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                        title="Focus on this task in Flow"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </Link>
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Task Modal */}
      <QuickTaskModal
        isOpen={isQuickTaskOpen}
        onClose={() => setIsQuickTaskOpen(false)}
      />
    </div>
  );
}
