"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Lock,
  Clock,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Compass,
} from "lucide-react";
import { OnboardingFormData } from "@/types";

interface StepSchedulePreviewProps {
  data: OnboardingFormData;
  onApprove: () => void;
  onBack: () => void;
}

export function StepSchedulePreview({
  data,
  onApprove,
  onBack,
}: StepSchedulePreviewProps) {
  const [approving, setApproving] = useState(false);

  const handleApprove = () => {
    setApproving(true);
    setTimeout(() => {
      onApprove();
    }, 600);
  };

  // Build schedule slots strictly from real user-provided parameters
  const scheduleSlots: Array<{
    time: string;
    title: string;
    desc: string;
    type: string;
    isFixed: boolean;
  }> = [];

  // 1. User habits (if entered)
  data.existingHabits.forEach((habit, idx) => {
    scheduleSlots.push({
      time: idx === 0 ? `${data.wakeTime} – 08:00` : "Flexible Rhythm",
      title: habit,
      desc: "Behavioral anchor habit established in setup",
      type: "habit",
      isFixed: false,
    });
  });

  // 2. Academic classes (if entered)
  data.timetable.forEach((tt) => {
    scheduleSlots.push({
      time: `${tt.startTime} – ${tt.endTime}`,
      title: `Class: ${tt.subject}`,
      desc: tt.locationOrLink ? `Location / Link: ${tt.locationOrLink}` : "Fixed academic commitment",
      type: "fixed",
      isFixed: true,
    });
  });

  // 3. Recurring professional meetings (if entered)
  data.recurringMeetings.forEach((rm) => {
    scheduleSlots.push({
      time: `${rm.startTime} – ${rm.endTime}`,
      title: `Meeting: ${rm.title}`,
      desc: `${rm.priority.toUpperCase()} priority sync commitment`,
      type: "fixed",
      isFixed: true,
    });
  });

  // 4. Short-term goal focus block (if entered)
  if (data.shortTermGoal && data.shortTermGoal.trim()) {
    scheduleSlots.push({
      time: "10:30 – 12:00",
      title: `Focus: ${data.shortTermGoal}`,
      desc: `Scheduled during your peak focus period (${data.preferredFocusDuration}m session)`,
      type: "deep_work",
      isFixed: false,
    });
  }

  // 5. Protected Bedtime
  if (data.sleepTime) {
    scheduleSlots.push({
      time: `${data.sleepTime} Bedtime`,
      title: "Protected Sleep Boundary",
      desc: "Preserves your physiological recovery window",
      type: "sleep",
      isFixed: true,
    });
  }

  const hasCustomItems = scheduleSlots.length > 1; // more than just sleep

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Profile Setup Ready</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
          Initial Schedule Preview & Approval
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {hasCustomItems
            ? `Review your initial daily schedule synthesized from your waking target (${data.wakeTime}), bedtime (${data.sleepTime}), and commitments.`
            : `You haven't added any fixed classes, meetings, or habits yet. Kronos will initialize your planner with a clean, flexible canvas.`}
        </p>
      </div>

      {/* Schedule Timeline Preview or Clean Open Canvas */}
      {hasCustomItems ? (
        <div className="bg-white rounded-2xl border border-[#e6e3da] shadow-xs overflow-hidden">
          <div className="p-4 bg-[#fdfcf9] border-b border-[#e6e3da] flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-600" />
              <span>Schedule for {data.name || "Your Workspace"}</span>
            </span>
            <span className="text-slate-500 font-medium">
              Sleep Target: {data.sleepTime}
            </span>
          </div>

          <div className="divide-y divide-[#f0ede6] p-2">
            {scheduleSlots.map((slot, idx) => (
              <div
                key={idx}
                className="p-3.5 flex items-start gap-4 transition-colors hover:bg-[#fcfbf9] rounded-xl"
              >
                <div className="w-28 shrink-0 text-left">
                  <span className="text-xs font-mono font-bold text-slate-800 block">
                    {slot.time}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize block mt-0.5">
                    {slot.type.replace("_", " ")}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{slot.title}</span>
                    {slot.isFixed && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700">
                        <Lock className="w-2.5 h-2.5" /> Fixed
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{slot.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e6e3da] p-6 sm:p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#faf9f6] border border-[#e6e3da] flex items-center justify-center mx-auto text-slate-700">
            <Compass className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
              Your Daily Planner is an Open Canvas
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              No sample or fabricated tasks will be added. Your workspace will launch completely clean, ready for you to schedule tasks with AI or create them manually.
            </p>
          </div>

          <div className="inline-flex flex-wrap items-center justify-center gap-3 p-3 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-xs text-slate-600 font-medium">
            <span>Wake Target: <strong>{data.wakeTime}</strong></span>
            <span className="text-slate-300">•</span>
            <span>Sleep Target: <strong>{data.sleepTime}</strong></span>
            <span className="text-slate-300">•</span>
            <span>Focus Interval: <strong>{data.preferredFocusDuration}m</strong></span>
          </div>
        </div>
      )}

      {/* Approval Box */}
      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Ready to activate this setup?</span>
          </h4>
          <p className="text-[11px] text-amber-900/80 mt-0.5">
            Approving will save your profile parameters to your account and open your primary workspace.
          </p>
        </div>

        <button
          onClick={handleApprove}
          disabled={approving}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all shrink-0 active:scale-98 cursor-pointer"
        >
          <span>{approving ? "Activating Schedule..." : "Approve & Launch My Planner"}</span>
          <ArrowRight className="w-4 h-4 text-amber-300" />
        </button>
      </div>

      {/* Navigation Controls */}
      <div className="pt-2 flex items-center justify-between border-t border-[#e6e3da]">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-[#e6e3da] text-xs font-semibold text-slate-700 hover:bg-[#f5f3ec] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Review</span>
        </button>
      </div>
    </div>
  );
}
