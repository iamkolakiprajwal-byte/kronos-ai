"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { UserRole } from "@/types";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  userType: UserRole;
  onLoadPreset: (role: UserRole) => void;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  stepTitle,
  userType,
  onLoadPreset,
}: StepIndicatorProps) {
  const percent = Math.round(((currentStep) / totalSteps) * 100);

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-medium">{stepTitle}</span>
        </div>

        {/* Evaluator Quick Preset Helper */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
          <span className="text-slate-400 font-medium">Auto-fill preset:</span>
          <button
            type="button"
            onClick={() => onLoadPreset("student")}
            className="px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition-colors"
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => onLoadPreset("professional")}
            className="px-2 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold transition-colors"
          >
            Pro
          </button>
          <button
            type="button"
            onClick={() => onLoadPreset("both")}
            className="px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition-colors"
          >
            Both
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#e6e3da] h-2 rounded-full overflow-hidden">
        <div
          className="bg-slate-900 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
