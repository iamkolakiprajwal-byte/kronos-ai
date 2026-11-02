"use client";

import React from "react";
import {
  User,
  GraduationCap,
  Briefcase,
  Compass,
  Clock,
  Target,
  Sparkles,
  Leaf,
  Edit2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { OnboardingFormData } from "@/types";

interface StepReviewSummaryProps {
  data: OnboardingFormData;
  onGoToStep: (step: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepReviewSummary({
  data,
  onGoToStep,
  onNext,
  onBack,
}: StepReviewSummaryProps) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div>
        <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
          Review Your Setup Summary
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Verify your parameters before the AI generates your initial personalized daily schedule. You can edit any section below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Identity & Persona */}
        <div className="bg-white rounded-2xl border border-[#e6e3da] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Identity & Role
              </span>
              <button
                type="button"
                onClick={() => onGoToStep(2)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-slate-900">{data.name}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700">
                {data.userType}
              </span>
            </div>
            <p className="text-xs text-slate-600">{data.email}</p>
            {data.headline && <p className="text-xs text-slate-500 mt-1">{data.headline}</p>}
            {data.institutionOrCompany && (
              <p className="text-xs text-slate-500">{data.institutionOrCompany}</p>
            )}
          </div>
        </div>

        {/* Card 2: Rhythm & Sleep */}
        <div className="bg-white rounded-2xl border border-[#e6e3da] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Daily Rhythm & Sleep
              </span>
              <button
                type="button"
                onClick={() => onGoToStep(4)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#faf9f6] border border-[#e6e3da]">
                <span className="text-[10px] text-slate-500 block">Wake Time</span>
                <span className="font-bold text-slate-800">{data.wakeTime}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#faf9f6] border border-[#e6e3da]">
                <span className="text-[10px] text-slate-500 block">Sleep Boundary</span>
                <span className="font-bold text-slate-800">{data.sleepTime}</span>
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-600">
              Peak Energy Window: <span className="font-semibold capitalize text-slate-900">{data.mostProductivePeriod}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Commitments (Academic / Pro) */}
        <div className="bg-white rounded-2xl border border-[#e6e3da] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Fixed Commitments
              </span>
              <button
                type="button"
                onClick={() => onGoToStep(data.userType === "professional" ? 5 : 5)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            {data.timetable.length > 0 && (
              <div className="mb-2">
                <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Classes ({data.timetable.length} slots):
                </span>
                <div className="flex flex-wrap gap-1">
                  {data.timetable.map((tt) => (
                    <span
                      key={tt.id}
                      className="text-[10px] px-2 py-0.5 rounded-sm bg-blue-50 text-blue-900 font-medium"
                    >
                      {tt.subject} ({tt.dayOfWeek.slice(0, 3)} {tt.startTime})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.recurringMeetings.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Meetings ({data.recurringMeetings.length} slots):
                </span>
                <div className="flex flex-wrap gap-1">
                  {data.recurringMeetings.map((rm) => (
                    <span
                      key={rm.id}
                      className="text-[10px] px-2 py-0.5 rounded-sm bg-indigo-50 text-indigo-900 font-medium"
                    >
                      {rm.title} ({rm.dayOfWeek.slice(0, 3)} {rm.startTime})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.timetable.length === 0 && data.recurringMeetings.length === 0 && (
              <p className="text-xs text-slate-400">No fixed commitments registered.</p>
            )}
          </div>
        </div>

        {/* Card 4: Goals, Habits & Focus */}
        <div className="bg-white rounded-2xl border border-[#e6e3da] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Goals & Productivity
              </span>
              <button
                type="button"
                onClick={() => onGoToStep(7)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            {data.shortTermGoal && (
              <div className="mb-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Short-Term Goal:</span>
                <p className="text-xs font-semibold text-slate-900 line-clamp-1">{data.shortTermGoal}</p>
              </div>
            )}

            <div className="text-xs text-slate-600 mt-2">
              Focus Sessions: <span className="font-semibold text-slate-900">{data.preferredFocusDuration} min</span> • Break: <span className="font-semibold text-slate-900">{data.preferredBreakDuration} min</span>
            </div>

            <div className="text-xs text-slate-600 mt-1">
              Planning Style: <span className="font-semibold capitalize text-slate-900">{data.planningStyle}</span>
            </div>
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
          <span>Generate Schedule Preview</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
        </button>
      </div>
    </div>
  );
}
