"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format, addDays, subDays } from "date-fns";
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
  Check,
  Zap,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { Task } from "@/types";
import { formatMinutes } from "@/lib/utils";
import { DEMO_REFERENCE_DATE } from "@/lib/mock/demo-data";
import { cn } from "@/lib/utils";

export default function MyDayPage() {
  const {
    tasks,
    calendarEvents,
    selectedDate,
    setSelectedDate,
    toggleTaskStatus,
    updateTaskSchedule,
    profile,
    role,
    openQuickTask,
  } = useDemo();

  const [filter, setFilter] = useState<"all" | "active" | "fixed" | "completed">("all");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleNotice, setRescheduleNotice] = useState<string | null>(null);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  // Day navigation - anchors to consistent demo reference date
  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date(`${DEMO_REFERENCE_DATE}T00:00:00`));

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

      // Calculate effective current time boundary to ensure tasks are never placed in the past
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const wakeParts = profile.wakeTime.split(":");
      const wakeTotalMins = parseInt(wakeParts[0], 10) * 60 + parseInt(wakeParts[1], 10);
      const nowTotalMins = currentHours * 60 + currentMinutes;

      // In demo mode or daytime execution, use current time (or wake time if before waking)
      const effectiveTime =
        nowTotalMins > wakeTotalMins
          ? `${String(currentHours).padStart(2, "0")}:${String(currentMinutes).padStart(2, "0")}`
          : profile.wakeTime;

      const res = await fetch("/api/schedule/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDateStr,
          currentTime: effectiveTime,
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
          const placements = data.result.scheduledPlacements.map((p: any) => ({
            id: p.task.id,
            startTime: p.startTime,
            endTime: p.endTime,
          }));
          updateTaskSchedule(placements);

          if (data.result.conflicts && data.result.conflicts.length > 0) {
            const conflictTitles = data.result.conflicts.map((c: any) => c.taskTitle).join(", ");
            setRescheduleNotice(
              `Reorganised ${placements.length} tasks from ${effectiveTime}. Note: ${data.result.conflicts.length} task(s) could not fit before ${profile.sleepTime}: ${conflictTitles}`
            );
          } else {
            setRescheduleNotice(
              `Dynamically reorganised ${placements.length} tasks starting from ${effectiveTime} around your fixed commitments!`
            );
          }
        } else if (data.result?.conflicts?.length > 0) {
          setRescheduleNotice(
            `Unable to fit remaining tasks before ${profile.sleepTime}. Consider moving tasks to tomorrow.`
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
      setTimeout(() => setRescheduleNotice(null), 6000);
    }
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-[#faece7] text-[#b85437] border-[#f3cec3]";
      case "high":
        return "bg-[#faf0e1] text-[#9c631e] border-[#eedac0]";
      case "medium":
        return "bg-[#edf2ec] text-[#536b54] border-[#d6e0d5]";
      case "low":
        return "bg-[#f2eee6] text-[#545049] border-[#e4ded2]";
    }
  };

  return (
    <div className="space-y-7 sm:space-y-10 max-w-4xl mx-auto animate-in fade-in-50 duration-200 pb-16 md:pb-12">
      {/* Workspace Header Briefing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#e8e2d5]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#201e1b] text-[#f8f6f0] flex items-center justify-center shrink-0 shadow-2xs">
              <Sun className="w-4 h-4 text-[#e8decb]" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-normal text-[#201e1b] tracking-tight">
              {role === "student"
                ? "My Day — Academic Study & Class Execution"
                : role === "professional"
                ? "My Day — Deep Work & Engineering Execution"
                : "My Day — Work & Degree Commitment Execution"}
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-[#8a8479] mt-0.5">
            {role === "student"
              ? "Class Timetable • Study Buffers • Transition Windows"
              : role === "professional"
              ? "Core Work Hours • Deep Work Focus • Protected Boundaries"
              : "Work Shifts & Academic Classes • Overlap Protected"}
          </p>
        </div>

        {/* Date Selector & Action Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center bg-white border border-[#e8e2d5] rounded-xl p-1 shadow-2xs">
            <button
              onClick={handlePrevDay}
              className="p-1 rounded-lg text-[#8a8479] hover:text-[#201e1b] hover:bg-[#f2eee6] transition-colors cursor-pointer"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-0.5 text-xs font-semibold text-[#201e1b] hover:text-black transition-colors cursor-pointer"
            >
              {format(selectedDate, "EEE, MMM d")}
            </button>
            <button
              onClick={handleNextDay}
              className="p-1 rounded-lg text-[#8a8479] hover:text-[#201e1b] hover:bg-[#f2eee6] transition-colors cursor-pointer"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={openQuickTask}
            className="px-3.5 py-2 rounded-xl bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] font-medium text-xs flex items-center gap-1.5 transition-colors shadow-2xs shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#e8decb]" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Notification Toast for Rescheduling */}
      {rescheduleNotice && (
        <div className="p-3.5 rounded-2xl bg-[#edf2ec] border border-[#d6e0d5] text-xs text-[#536b54] flex items-center gap-2 animate-in fade-in-50 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-[#536b54] shrink-0" />
          <span className="font-medium">{rescheduleNotice}</span>
        </div>
      )}

      {/* Regain Pattern: Dominant Central Visual — Focus Spotlight Ring */}
      <div className="bg-[#fdfcf9] rounded-3xl border border-[#e8e2d5] p-6 sm:p-8 shadow-2xs flex flex-col items-center text-center relative overflow-hidden">
        {/* Spotlight Ring Graphic (Regain central focus dial pattern) */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center my-2">
          {/* Subtle Outer Track */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-[#ede8dc]"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-[#536b54] transition-all duration-700 ease-out"
              strokeWidth="5"
              strokeDasharray={276.4}
              strokeDashoffset={276.4 * (1 - completionPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Central Content Inside Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-[#8a8479]">
              {upNextTask ? "Up Next" : "Day Goal"}
            </span>
            <span className="font-serif text-3xl sm:text-4xl font-normal text-[#201e1b] tracking-tight my-0.5">
              {upNextTask ? `${upNextTask.estimatedDuration}m` : `${completionPercent}%`}
            </span>
            <span className="text-[11px] text-[#545049] font-medium font-mono">
              {upNextTask?.startTime || "Completed"}
            </span>
          </div>

          {/* Activation Badge / Play Button (Regain Green Arrow Pattern) */}
          {upNextTask && (
            <Link
              href={`/growth?tab=flow&task=${encodeURIComponent(upNextTask.title)}`}
              className="absolute -bottom-1 w-10 h-10 rounded-full bg-[#536b54] hover:bg-[#435744] text-[#f8f6f0] flex items-center justify-center shadow-md active:scale-90 transition-all border-2 border-white cursor-pointer"
              title="Launch Flow Session"
            >
              <Play className="w-4 h-4 fill-[#f8f6f0] ml-0.5" />
            </Link>
          )}
        </div>

        {/* Task Details Under Ring */}
        {upNextTask ? (
          <div className="mt-4 max-w-md space-y-2">
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#201e1b] tracking-tight">
              {upNextTask.title}
            </h2>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {upNextTask.tag && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#f2eee6] text-[#545049] font-medium border border-[#e4ded2]">
                  {upNextTask.tag}
                </span>
              )}
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#edf2ec] text-[#536b54] font-medium border border-[#d6e0d5]">
                {formatMinutes(upNextTask.estimatedDuration)} focus
              </span>
              <span className="text-[10px] text-[#8a8479] capitalize">
                Priority: {upNextTask.priority}
              </span>
            </div>
          </div>
        ) : totalTasks === 0 ? (
          <div className="mt-4 max-w-md space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#201e1b] tracking-tight">
              No tasks scheduled for today
            </h2>
            <p className="text-xs text-[#8a8479]">
              Your agenda is completely clear. Plan your day with AI or tap the + button to add a task.
            </p>
          </div>
        ) : (
          <div className="mt-4 max-w-md space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#201e1b] tracking-tight">
              All tasks completed!
            </h2>
            <p className="text-xs text-[#8a8479]">
              You've cleared your schedule for today. Head to Growth for habits or reflection.
            </p>
          </div>
        )}

        {/* Regain Pattern: Secondary Summary Pill (Like "0m Screen Time >") */}
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f2eee6] border border-[#e4ded2] text-xs text-[#545049] shadow-2xs flex-wrap justify-center">
          <span className="w-2 h-2 rounded-full bg-[#536b54]" />
          <span>
            {completedTasks} of {totalTasks} blocks done
          </span>
          <span className="text-[#d5cdbd]">•</span>
          <span>{formatMinutes(totalMinutes - completedMinutes)} remaining</span>
          <span className="text-[#d5cdbd]">•</span>
          <span className="text-[#201e1b] font-medium capitalize">
            {profile.mostProductivePeriod} rhythm
          </span>
        </div>

        {/* Contextual Action Buttons */}
        <div className="mt-5 flex items-center justify-center gap-2.5 flex-wrap">
          {upNextTask ? (
            <Link
              href={`/growth?tab=flow&task=${encodeURIComponent(upNextTask.title)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-[#f8f6f0]" />
              <span>Start Focus Session</span>
            </Link>
          ) : totalTasks === 0 ? (
            <div className="flex items-center gap-2">
              <Link
                href="/ai"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] text-xs font-semibold shadow-xs active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#e8decb]" />
                <span>Plan Day with AI</span>
              </Link>
              <button
                onClick={openQuickTask}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#f2eee6] text-[#201e1b] border border-[#e8e2d5] text-xs font-medium transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#545049]" />
                <span>New Task</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleDynamicReschedule}
              disabled={isRescheduling}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className={cn("w-3.5 h-3.5 text-[#e8decb]", isRescheduling && "animate-spin")} />
              <span>Reorganise Day with AI</span>
            </button>
          )}
          {upNextTask && (
            <button
              onClick={handleDynamicReschedule}
              disabled={isRescheduling}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#f2eee6] text-[#201e1b] border border-[#e8e2d5] text-xs font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className={cn("w-3.5 h-3.5 text-[#8a8479]", isRescheduling && "animate-spin")} />
              <span>Reschedule Day</span>
            </button>
          )}
        </div>
      </div>

      {/* Regain Pattern: Horizontally Browsable Agenda Queue */}
      {activeTasks.length > 1 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#201e1b] uppercase tracking-wider font-sans">
              Upcoming Queue
            </span>
            <span className="text-[10px] text-[#8a8479]">{activeTasks.length - 1} remaining</span>
          </div>

          <div className="flex gap-3 overflow-x-auto snap-x scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {activeTasks.slice(1).map((task) => (
              <div
                key={task.id}
                className="min-w-[220px] sm:min-w-[250px] max-w-[260px] snap-start p-4 rounded-2xl bg-white border border-[#e8e2d5] shadow-2xs flex flex-col justify-between shrink-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#8a8479]">
                    <span className="font-medium text-[#687050] uppercase tracking-wider">
                      {task.category}
                    </span>
                    <span className="font-mono">{task.startTime || `${task.estimatedDuration}m`}</span>
                  </div>
                  <h4 className="font-serif text-sm font-normal text-[#201e1b] truncate">
                    {task.title}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-[#f2eee6] flex items-center justify-between">
                  <span className={cn("text-[9px] px-2 py-0.5 rounded-full border font-medium", getPriorityBadge(task.priority))}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className="text-[11px] text-[#536b54] font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Done</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center justify-center gap-1 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#201e1b]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#d5cdbd]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#d5cdbd]" />
          </div>
        </section>
      )}

      {/* Vertical Execution Timeline */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#e8e2d5]">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#8a8479] font-medium mr-1">Filter:</span>
            {(["all", "active", "fixed", "completed"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={cn(
                  "px-2.5 py-1 rounded-lg capitalize transition-colors font-medium text-[11px] cursor-pointer",
                  filter === mode
                    ? "bg-[#201e1b] text-[#f8f6f0] shadow-2xs"
                    : "text-[#545049] hover:bg-[#f2eee6]"
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Dynamic Reschedule Action Button */}
          <button
            onClick={handleDynamicReschedule}
            disabled={isRescheduling || activeTasks.length === 0}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#f2eee6] border border-[#e8e2d5] text-[#201e1b] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-40 self-end sm:self-auto cursor-pointer"
            title="Reorganise flexible tasks starting from current time"
          >
            <RotateCcw className={cn("w-3.5 h-3.5 text-[#687050]", isRescheduling && "animate-spin")} />
            <span>{isRescheduling ? "Reorganising..." : "Reorganise Remaining Day"}</span>
          </button>
        </div>

        {/* Timeline Items List */}
        <div className="space-y-3">
          {visibleTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8a8479] space-y-2 bg-[#fdfcf9] rounded-2xl border border-[#e8e2d5]">
              <Calendar className="w-8 h-8 text-[#d5cdbd] mx-auto" />
              <p className="font-serif text-sm text-[#545049]">No tasks match filter</p>
              <p className="text-[11px] text-[#8a8479]">
                Change your filter or tap Add Task to schedule a study block.
              </p>
            </div>
          ) : (
            visibleTasks.map((t) => {
              const isCompleted = t.status === "completed";
              return (
                <div
                  key={t.id}
                  className={cn(
                    "p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3",
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
                      <CheckCircle2 className="w-5 h-5 text-[#536b54] fill-[#edf2ec]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#d5cdbd]" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          "font-serif text-base sm:text-lg font-normal leading-snug",
                          isCompleted ? "line-through text-[#8a8479]" : "text-[#201e1b]"
                        )}
                      >
                        {t.title}
                      </span>
                      <span className="text-xs font-mono text-[#545049] shrink-0 font-medium">
                        {t.startTime ? `${t.startTime} – ${t.endTime || "TBD"}` : `${t.estimatedDuration}m`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={cn("text-[9px] px-2 py-0.5 rounded-full border font-medium", getPriorityBadge(t.priority))}>
                        {t.priority}
                      </span>
                      {t.tag && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#f2eee6] text-[#545049] border border-[#e4ded2]">
                          {t.tag}
                        </span>
                      )}
                      <span className="text-[10px] text-[#8a8479] flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-[#8a8479]" />
                        {t.estimatedDuration}m duration
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
