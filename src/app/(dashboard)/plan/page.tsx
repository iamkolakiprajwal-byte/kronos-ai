"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/context/demo-context";
import { formatMinutes } from "@/lib/utils";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  Plus,
  Lock,
  Trash2,
  Sparkles,
  ArrowRight,
  Sun,
} from "lucide-react";

export default function PlanPage() {
  const { tasks, toggleTaskStatus, deleteTask, role, profile } = useDemo();
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "urgent">("all");

  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return t.status !== "completed";
    if (filter === "completed") return t.status === "completed";
    if (filter === "urgent") return t.priority === "urgent" || t.priority === "high";
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-200">
      {/* Migration Notice Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
        <div className="flex items-center gap-2.5">
          <Sun className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Looking for daily execution? Check out the new <strong>My Day</strong> workspace with live spotlight focus and mid-day AI reorganisation.
          </span>
        </div>
        <Link
          href="/my-day"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors shrink-0 shadow-2xs"
        >
          <span>Open My Day</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-[#e6e3da]">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Schedule & Task Management
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
            Review your daily allocations, flexible work blocks, and fixed commitments.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 p-1 bg-[#f0ede6] rounded-xl self-start sm:self-auto border border-[#e6e3da] overflow-x-auto max-w-full">
          {(["all", "active", "urgent", "completed"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
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

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-[#e6e3da] shadow-xs overflow-hidden">
        <div className="p-3 sm:p-4 bg-[#fdfcf9] border-b border-[#e6e3da] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            Showing {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
          </span>
          <span className="text-[10px] sm:text-[11px]">
            Target Focus Duration: {profile.preferredFocusDuration} min sessions
          </span>
        </div>

        <div className="divide-y divide-[#f0ede6]">
          {filteredTasks.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-xs text-slate-400 space-y-1">
              <p className="font-serif text-sm text-slate-600">No tasks scheduled yet</p>
              <p className="text-[11px] text-slate-400">
                Tap the floating + button in the bottom right or ask AI to schedule your first task.
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isCompleted = task.status === "completed";
              return (
                <div
                  key={task.id}
                  className={`p-3 sm:p-4 flex items-start justify-between gap-3 transition-colors ${
                    isCompleted ? "bg-[#faf9f6]/70" : "hover:bg-[#fbfaf7]"
                  }`}
                >
                  <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="w-10 h-10 -ml-2 -mt-2 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors shrink-0 touch-manipulation"
                      aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span
                          className={`text-xs sm:text-sm font-semibold ${
                            isCompleted ? "line-through text-slate-400" : "text-slate-900"
                          }`}
                        >
                          {task.title}
                        </span>

                        {task.isFixed && (
                          <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            <Lock className="w-2.5 h-2.5" /> Fixed
                          </span>
                        )}

                        {task.tag && (
                          <span className="text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                            {task.tag}
                          </span>
                        )}

                        <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-slate-500 flex-wrap">
                        {task.startTime && task.endTime && (
                          <span className="font-medium text-slate-700 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {task.startTime} – {task.endTime}
                          </span>
                        )}
                        <span>{formatMinutes(task.estimatedDuration)}</span>
                        {task.deadline && (
                          <span className="text-rose-600 font-medium">Due: {task.deadline}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors shrink-0"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
