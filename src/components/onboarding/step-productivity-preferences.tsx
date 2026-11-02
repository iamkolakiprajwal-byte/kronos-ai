"use client";

import React from "react";
import { Clock, Coffee, Sliders, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepProductivityPreferencesProps {
  data: {
    preferredFocusDuration: number;
    preferredBreakDuration: number;
    planningStyle: "structured" | "flexible" | "time-blocked";
  };
  onChange: (fields: Partial<StepProductivityPreferencesProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

const styles = [
  {
    id: "time-blocked" as const,
    title: "Time-Blocked",
    desc: "Definite, designated calendar slots for every task and commitment.",
  },
  {
    id: "structured" as const,
    title: "Structured Flow",
    desc: "Fixed meetings anchored; flexible tasks grouped into open focus windows.",
  },
  {
    id: "flexible" as const,
    title: "Fluid / Outcome",
    desc: "Energy-matched task list with loose buffers and dynamic re-sequencing.",
  },
];

export function StepProductivityPreferences({
  data,
  onChange,
  onNext,
  onBack,
}: StepProductivityPreferencesProps) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sliders className="w-5 h-5 text-slate-700" />
          <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
            Productivity & Focus Preferences
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          How do you prefer to segment your mental energy and structure your working day?
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e6e3da] p-6 shadow-xs space-y-6">
        {/* Focus Duration */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Preferred Single-Task Focus Duration</span>
          </label>
          <p className="text-[11px] text-slate-500 mb-2.5">
            The ideal length of deep concentration before fatigue sets in.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[25, 45, 50, 60, 90].map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => onChange({ preferredFocusDuration: dur })}
                className={cn(
                  "p-2.5 rounded-xl border text-xs font-semibold transition-all text-center",
                  data.preferredFocusDuration === dur
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-[#faf9f6] text-slate-700 border-[#e6e3da] hover:bg-slate-100"
                )}
              >
                <span className="block font-bold">{dur} mins</span>
                <span className="text-[10px] opacity-75 font-normal">
                  {dur === 25 ? "Pomodoro" : dur === 50 ? "Standard" : dur === 90 ? "Ultradian" : "Block"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Break Duration */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
            <Coffee className="w-4 h-4 text-amber-600" />
            <span>Target Rest / Transition Buffer Between Sessions</span>
          </label>
          <p className="text-[11px] text-slate-500 mb-2.5">
            Buffer time to stretch, hydrate, and clear mental context.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[5, 10, 15, 20].map((brk) => (
              <button
                key={brk}
                type="button"
                onClick={() => onChange({ preferredBreakDuration: brk })}
                className={cn(
                  "p-2.5 rounded-xl border text-xs font-semibold transition-all text-center",
                  data.preferredBreakDuration === brk
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-[#faf9f6] text-slate-700 border-[#e6e3da] hover:bg-slate-100"
                )}
              >
                <span className="block font-bold">{brk} mins</span>
                <span className="text-[10px] opacity-75 font-normal">
                  {brk <= 10 ? "Short rest" : "Extended pause"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Planning Style */}
        <div className="pt-2 border-t border-[#f0ede6]">
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Planning & Schedule Layout Style
          </label>
          <p className="text-[11px] text-slate-500 mb-3">
            Choose how you prefer the AI to structure your day agenda.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {styles.map((st) => {
              const isSelected = data.planningStyle === st.id;
              return (
                <div
                  key={st.id}
                  onClick={() => onChange({ planningStyle: st.id })}
                  className={cn(
                    "p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between text-left",
                    isSelected
                      ? "bg-amber-50/70 border-slate-900 ring-1 ring-slate-900/10 shadow-2xs"
                      : "bg-[#faf9f6] border-[#e6e3da] hover:bg-white"
                  )}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{st.title}</span>
                    <span className="text-[11px] text-slate-500 leading-snug block mt-1">{st.desc}</span>
                  </div>
                </div>
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
