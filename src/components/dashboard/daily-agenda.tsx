"use client";

import React from "react";
import { format, isSameDay } from "date-fns";
import {
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Lock,
  Flame,
  Calendar,
  Sparkles,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { Task, CalendarEvent } from "@/types";
import { cn, formatMinutes } from "@/lib/utils";

interface DailyAgendaProps {
  onOpenQuickTask?: () => void;
}

export function DailyAgenda({ onOpenQuickTask }: DailyAgendaProps) {
  const {
    tasks,
    calendarEvents,
    selectedDate,
    toggleTaskStatus,
    deleteTask,
    profile,
  } = useDemo();

  const [todayDate, setTodayDate] = React.useState<Date>(() => new Date("2026-11-02T00:00:00"));

  React.useEffect(() => {
    setTodayDate(new Date());
  }, []);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const isToday = isSameDay(selectedDate, todayDate);

  // Filter tasks and calendar events for the selected date
  const dayTasks = tasks.filter((t) => t.scheduledDate === selectedDateStr);
  const dayEvents = calendarEvents.filter((e) => e.date === selectedDateStr);

  // Calculate statistics
  const totalTasks = dayTasks.length;
  const completedTasks = dayTasks.filter((t) => t.status === "completed").length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalMinutes = dayTasks.reduce((acc, t) => acc + t.estimatedDuration, 0);
  const completedMinutes = dayTasks
    .filter((t) => t.status === "completed")
    .reduce((acc, t) => acc + t.estimatedDuration, 0);

  // Priority color helper
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
    <div className="space-y-6">
      {/* Daily Progress & Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Progress Card */}
        <div className="p-4 bg-white rounded-xl border border-[#e6e3da] shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Completion Rate</span>
            <span className="font-bold text-slate-800">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#f0ede6] h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {completedTasks} of {totalTasks} tasks finished
          </p>
        </div>

        {/* Focus Hours Card */}
        <div className="p-4 bg-white rounded-xl border border-[#e6e3da] shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Focus Time Planned</span>
            <Clock className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-serif">
            {formatMinutes(totalMinutes)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {formatMinutes(completedMinutes)} completed so far
          </p>
        </div>

        {/* Routine Energy Profile */}
        <div className="p-4 bg-white rounded-xl border border-[#e6e3da] shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Peak Window</span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 capitalize font-serif">
            {profile.mostProductivePeriod}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Sleep: {profile.sleepTime} • Wake: {profile.wakeTime}
          </p>
        </div>
      </div>

      {/* Agenda & Tasks Notebook Section */}
      <div className="bg-white rounded-2xl border border-[#e6e3da] shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="p-5 border-b border-[#e6e3da] flex items-center justify-between bg-[#fdfcf9]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-bold text-slate-900 tracking-tight">
                {isToday ? "Today's Agenda & Action Plan" : `Agenda for ${format(selectedDate, "MMMM d")}`}
              </h3>
              <span className="text-xs text-slate-500 font-sans">
                ({dayTasks.length} {dayTasks.length === 1 ? "item" : "items"})
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Deterministic schedule • AI will adapt flexible tasks around fixed lectures
            </p>
          </div>

          {onOpenQuickTask && (
            <button
              onClick={onOpenQuickTask}
              className="px-3 py-1.5 bg-[#f5f3ec] hover:bg-[#ede9df] text-slate-800 text-xs font-semibold rounded-lg border border-[#e6e3da] transition-colors"
            >
              + Quick Add
            </button>
          )}
        </div>

        {/* Agenda Task List */}
        <div className="divide-y divide-[#f0ede6]">
          {dayTasks.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">No tasks planned for this day</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Use the AI Assistant input below or click "+ Quick Add" to plan your study blocks, assignments, or work sprints.
              </p>
            </div>
          ) : (
            dayTasks.map((task) => {
              const isCompleted = task.status === "completed";
              return (
                <div
                  key={task.id}
                  className={cn(
                    "p-4 transition-colors flex items-start gap-3.5 group",
                    isCompleted ? "bg-[#faf9f6]/80 text-slate-400" : "hover:bg-[#fbfaf7]"
                  )}
                >
                  {/* Completion Toggle */}
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-hidden"
                    aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>

                  {/* Task Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "text-sm font-medium transition-all",
                          isCompleted
                            ? "line-through text-slate-400"
                            : "text-slate-900 font-semibold"
                        )}
                      >
                        {task.title}
                      </span>

                      {/* Fixed Commitment Indicator */}
                      {task.isFixed && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          <Lock className="w-2.5 h-2.5" />
                          Fixed
                        </span>
                      )}

                      {/* Tag / Subject badge */}
                      {task.tag && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80">
                          {task.tag}
                        </span>
                      )}

                      {/* Priority Badge */}
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border",
                          getPriorityBadge(task.priority)
                        )}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p
                        className={cn(
                          "text-xs mt-1 leading-relaxed",
                          isCompleted ? "text-slate-400" : "text-slate-600"
                        )}
                      >
                        {task.description}
                      </p>
                    )}

                    {/* Time Slot & Duration Info */}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                      {task.startTime && task.endTime && (
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {task.startTime} – {task.endTime}
                        </span>
                      )}
                      <span>Duration: {formatMinutes(task.estimatedDuration)}</span>
                      {task.deadline && (
                        <span className="text-rose-600 font-medium">
                          Due: {task.deadline.split(" ")[1] || task.deadline}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
