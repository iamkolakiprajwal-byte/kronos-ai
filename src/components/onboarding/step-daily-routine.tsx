"use client";

import React from "react";
import { Clock, Moon, Sun, Sunrise, Sunset, Flame, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepDailyRoutineProps {
  data: {
    wakeTime: string;
    sleepTime: string;
    availableDays: string[];
    mostProductivePeriod: "morning" | "afternoon" | "evening" | "night";
  };
  onChange: (fields: Partial<StepDailyRoutineProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const periods = [
  {
    id: "morning" as const,
    label: "Morning",
    desc: "08:00 – 12:00 (High clarity, analytical work)",
    icon: Sunrise,
  },
  {
    id: "afternoon" as const,
    label: "Afternoon",
    desc: "12:00 – 17:00 (Execution, calls, labs)",
    icon: Sun,
  },
  {
    id: "evening" as const,
    label: "Evening",
    desc: "17:00 – 21:00 (Revision, creative tasks)",
    icon: Sunset,
  },
  {
    id: "night" as const,
    label: "Night",
    desc: "21:00 – 00:00 (Quiet focus, minimal distractions)",
    icon: Moon,
  },
];

export function StepDailyRoutine({ data, onChange, onNext, onBack }: StepDailyRoutineProps) {
  const toggleDay = (day: string) => {
    const exists = data.availableDays.includes(day);
    if (exists) {
      if (data.availableDays.length > 1) {
        onChange({ availableDays: data.availableDays.filter((d) => d !== day) });
      }
    } else {
      onChange({ availableDays: [...data.availableDays, day] });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div>
        <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
          Biological Routine & Energy Rhythm
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Kronos schedules your heaviest cognitive tasks during peak energy hours and strictly protects your sleep.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e6e3da] p-6 shadow-xs space-y-6">
        {/* Wake and Sleep Times */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#e6e3da]">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Sunrise className="w-4 h-4 text-amber-600" />
              <span>Wake-up Target</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-2">When do you usually start your day?</p>
            <input
              type="time"
              value={data.wakeTime}
              onChange={(e) => onChange({ wakeTime: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#e6e3da] rounded-lg text-sm font-semibold text-slate-800"
            />
          </div>

          <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#e6e3da]">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Sleep Target (No-Work Zone)</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-2">Tasks will never be scheduled past this.</p>
            <input
              type="time"
              value={data.sleepTime}
              onChange={(e) => onChange({ sleepTime: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#e6e3da] rounded-lg text-sm font-semibold text-slate-800"
            />
          </div>
        </div>

        {/* Peak Energy Period */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>When is your mental focus at its sharpest?</span>
          </label>
          <p className="text-[11px] text-slate-500 mb-3">
            Complex problem solving, coding, and heavy exam study will automatically be prioritized for this window.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {periods.map((p) => {
              const Icon = p.icon;
              const isSelected = data.mostProductivePeriod === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onChange({ mostProductivePeriod: p.id })}
                  className={cn(
                    "p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3",
                    isSelected
                      ? "bg-amber-50/70 border-slate-900 ring-1 ring-slate-900/10 shadow-2xs"
                      : "bg-[#faf9f6] border-[#e6e3da] hover:bg-white"
                  )}
                >
                  <div className={cn("p-2 rounded-lg", isSelected ? "bg-slate-900 text-amber-200" : "bg-white text-slate-600 border border-[#e6e3da]")}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{p.label}</span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">{p.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Planning Days */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Active Planning Days
          </label>
          <p className="text-[11px] text-slate-500 mb-2.5">
            Select the days of the week you want scheduled activities to be actively mapped.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {allDays.map((day) => {
              const isChecked = data.availableDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                    isChecked
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-[#faf9f6] text-slate-600 border-[#e6e3da] hover:bg-slate-100"
                  )}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="pt-4 flex items-center justify-between border-t border-[#e6e3da]">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-[#e6e3da] text-xs font-semibold text-slate-700 hover:bg-[#f5f3ec] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
        >
          <span>Continue</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
        </button>
      </div>
    </div>
  );
}
