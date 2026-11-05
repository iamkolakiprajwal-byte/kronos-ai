"use client";

import React, { useState } from "react";
import { X, Plus, Clock, Tag, Flag, Lock, Sparkles } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { Task, Priority } from "@/types";
import { format } from "date-fns";

interface QuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickTaskModal({ isOpen, onClose }: QuickTaskModalProps) {
  const { addTask, selectedDate, role } = useDemo();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Task["category"]>(role === "student" ? "study" : "work");
  const [priority, setPriority] = useState<Priority>("medium");
  const [duration, setDuration] = useState(45);
  const [startTime, setStartTime] = useState("");
  const [isFixed, setIsFixed] = useState(false);
  const [tag, setTag] = useState(role === "student" ? "CS 106B" : "Architecture");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    addTask({
      title,
      category,
      priority,
      status: "todo",
      estimatedDuration: Number(duration),
      scheduledDate: dateStr,
      startTime: startTime || undefined,
      isFixed,
      tag: tag || undefined,
    });

    setTitle("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in-50 duration-150">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl border-t sm:border border-[#e6e3da] shadow-xl w-full sm:max-w-lg max-h-[88dvh] overflow-y-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#e6e3da] bg-[#fdfcf9] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-300 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900">Add New Plan Item</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500">
                Scheduled for {format(selectedDate, "MMMM d, yyyy")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          data-form-type="other"
          noValidate
          className="p-4 sm:p-6 space-y-3.5 sm:space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
            <input
              type="text"
              name="quick_task_title"
              id="quick_task_title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read economics chapter 4, review RFC pull request"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck={false}
              enterKeyHint="next"
              data-form-type="other"
              data-lpignore="true"
              className="w-full px-3.5 py-2.5 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-800"
              >
                <option value="study">Study / Academic</option>
                <option value="work">Work / Meeting</option>
                <option value="personal">Personal / Creative</option>
                <option value="habit">Habit / Routine</option>
                <option value="sustainability">Eco / Sustainability</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-800"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Duration
              </label>
              <div className="flex items-center gap-1.5">
                {[25, 45, 60, 90].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDuration(dur)}
                    className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                      duration === dur
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-[#fbfaf7] text-slate-700 border-[#e6e3da] hover:bg-slate-100"
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tag / Subject</label>
              <input
                type="text"
                name="quick_task_tag"
                id="quick_task_tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. ECON 201, Sprint 42"
                autoComplete="off"
                autoCorrect="off"
                enterKeyHint="done"
                data-form-type="other"
                data-lpignore="true"
                className="w-full px-3 py-2 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Fixed Commitment Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={isFixed}
                onChange={(e) => setIsFixed(e.target.checked)}
                className="mt-0.5 rounded border-amber-300 text-amber-700 focus:ring-amber-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-amber-950 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-700" /> Fixed Commitment (Cannot be rescheduled)
                </span>
                <span className="text-amber-800/80 text-[11px] block mt-0.5">
                  Check this for mandatory lectures, live client meetings, or exams.
                </span>
              </div>
            </label>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 sm:pt-4 border-t border-[#e6e3da]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#e6e3da] text-xs font-semibold text-slate-700 hover:bg-[#f5f3ec] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Add to Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
