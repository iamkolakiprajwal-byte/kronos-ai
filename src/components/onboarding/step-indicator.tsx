"use client";

import React from "react";
import { UserRole } from "@/types";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  userType: UserRole;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  stepTitle,
}: StepIndicatorProps) {
  const percent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 mb-2 gap-1.5 sm:gap-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-semibold text-slate-900 uppercase tracking-wider text-[10px] sm:text-[11px]">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-medium truncate">{stepTitle}</span>
        </div>
        <div className="text-[11px] font-medium text-slate-400">
          {percent}% Completed
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
