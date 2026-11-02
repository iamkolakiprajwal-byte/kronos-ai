"use client";

import React from "react";
import { Target, Sparkles, Calendar, ArrowRight, ArrowLeft } from "lucide-react";

interface StepGoalsProps {
  data: {
    shortTermGoal: string;
    longTermGoal: string;
  };
  onChange: (fields: Partial<StepGoalsProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepGoals({ data, onChange, onNext, onBack }: StepGoalsProps) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-5 h-5 text-amber-600" />
          <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
            Short-Term & Long-Term Goals
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          What are the main milestones you want to make tangible progress toward? Kronos will break these into daily focus blocks.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e6e3da] p-6 shadow-xs space-y-5">
        {/* Short Term Goal */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Primary Short-Term Outcome (Next 30–60 Days)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Active priority</span>
          </label>
          <p className="text-[11px] text-slate-500 mb-2">
            e.g. Finish semester project with distinction, publish systems RFC, or master algorithm problem sets.
          </p>
          <textarea
            rows={3}
            value={data.shortTermGoal}
            onChange={(e) => onChange({ shortTermGoal: e.target.value })}
            placeholder="What single outcome would make the next two months an overwhelming success?"
            className="w-full px-3.5 py-2.5 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all leading-relaxed"
          />
        </div>

        {/* Long Term Goal */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Strategic Horizon / Long-Term Skill (Next 3–6 Months)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Long-range capability</span>
          </label>
          <p className="text-[11px] text-slate-500 mb-2">
            e.g. Learn 3D Blender modeling, train for a half-marathon, transition to a staff engineering role.
          </p>
          <textarea
            rows={3}
            value={data.longTermGoal}
            onChange={(e) => onChange({ longTermGoal: e.target.value })}
            placeholder="What meaningful capability or milestone are you building over time?"
            className="w-full px-3.5 py-2.5 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all leading-relaxed"
          />
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNext}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Skip for now
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
    </div>
  );
}
