"use client";

import React, { useState } from "react";
import { X, Plus, Clock, Tag, Flag, Lock, Sparkles } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { Task, Priority } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [tag, setTag] = useState(role === "student" ? "Study" : "Core");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    addTask({
      title: title.trim(),
      category,
      priority,
      status: "todo",
      estimatedDuration: Number(duration),
      scheduledDate: dateStr,
      startTime: startTime || undefined,
      isFixed,
      tag: tag.trim() || undefined,
    });

    setTitle("");
    setStartTime("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#201e1b]/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in-50 duration-150">
      <div className="bg-[#fdfcf9] rounded-t-3xl sm:rounded-2xl border-t sm:border border-[#e8e2d5] shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Mobile bottom sheet grab handle */}
        <div className="w-10 h-1 bg-[#d5cdbd] rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[#e8e2d5] bg-[#fbf9f5] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#201e1b] text-[#f8f6f0] flex items-center justify-center shadow-2xs">
              <Plus className="w-4 h-4 text-[#e8decb]" />
            </div>
            <div>
              <h3 className="font-serif font-normal text-base sm:text-lg text-[#201e1b]">Add New Plan Item</h3>
              <p className="text-[10px] sm:text-[11px] text-[#8a8479]">
                Scheduled for {format(selectedDate, "MMMM d, yyyy")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8a8479] hover:text-[#201e1b] hover:bg-[#f2eee6] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          data-form-type="other"
          noValidate
          className="p-5 sm:p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-[#545049] mb-1.5">Task Title</label>
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
              className="w-full px-3.5 py-2.5 bg-white border border-[#e8e2d5] rounded-xl text-xs sm:text-sm text-[#201e1b] placeholder:text-[#8a8479] focus:outline-hidden focus:ring-1 focus:ring-[#201e1b] focus:border-[#201e1b] transition-all shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#545049] mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-[#e8e2d5] rounded-xl text-xs text-[#201e1b] shadow-2xs cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#201e1b]"
              >
                <option value="study">Study / Academic</option>
                <option value="work">Work / Meeting</option>
                <option value="personal">Personal / Creative</option>
                <option value="habit">Habit / Routine</option>
                <option value="sustainability">Eco / Sustainability</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#545049] mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-white border border-[#e8e2d5] rounded-xl text-xs text-[#201e1b] shadow-2xs cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#201e1b]"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#545049] mb-1.5">
              Estimated Duration
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[25, 45, 60, 90].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDuration(dur)}
                  className={cn(
                    "py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer text-center",
                    duration === dur
                      ? "bg-[#201e1b] text-white border-[#201e1b] shadow-xs font-semibold"
                      : "bg-white text-[#545049] border-[#e8e2d5] hover:bg-[#f2eee6]"
                  )}
                >
                  {dur}m
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#545049] mb-1.5">
                Start Time (Optional)
              </label>
              <div className="flex items-center gap-1.5 bg-white border border-[#e8e2d5] rounded-xl px-3 py-2 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-[#8a8479] shrink-0" />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-transparent border-0 text-xs text-[#201e1b] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#545049] mb-1.5">Tag / Subject</label>
              <div className="flex items-center gap-1.5 bg-white border border-[#e8e2d5] rounded-xl px-3 py-2 shadow-2xs">
                <Tag className="w-3.5 h-3.5 text-[#8a8479] shrink-0" />
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
                  className="w-full bg-transparent border-0 text-xs text-[#201e1b] placeholder:text-[#8a8479] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Fixed Commitment Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 p-3 sm:p-3.5 bg-[#edf2ec]/70 border border-[#d6e0d5] rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={isFixed}
                onChange={(e) => setIsFixed(e.target.checked)}
                className="mt-0.5 rounded border-[#d6e0d5] text-[#536b54] focus:ring-[#536b54]"
              />
              <div className="text-xs">
                <span className="font-semibold text-[#201e1b] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#536b54]" /> Fixed Commitment (Cannot be rescheduled)
                </span>
                <span className="text-[#545049] text-[11px] block mt-0.5">
                  Check this for mandatory lectures, live client meetings, or exams.
                </span>
              </div>
            </label>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 pb-2 sm:pb-0 sm:pt-4 border-t border-[#e8e2d5]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#e8e2d5] text-xs font-semibold text-[#545049] hover:bg-[#f2eee6] transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] text-xs font-semibold shadow-2xs transition-colors cursor-pointer text-center"
            >
              Add to Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
