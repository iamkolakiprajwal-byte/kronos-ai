"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Lock,
  Clock,
  Sunrise,
  Moon,
  Coffee,
  ArrowRight,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { OnboardingFormData } from "@/types";
import { formatMinutes } from "@/lib/utils";

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

  // Generate simulated schedule slots from user parameters
  const scheduleSlots = [
    {
      time: `${data.wakeTime} – 08:30`,
      title: `Morning Routine & Anchor Habit`,
      desc: data.existingHabits[0] ? `Context cue: ${data.existingHabits[0]}` : "Hydration, breakfast & day planning",
      type: "habit" as const,
      isFixed: false,
    },
    ...(data.timetable.slice(0, 1).map((tt) => ({
      time: `${tt.startTime} – ${tt.endTime}`,
      title: `Academic Lecture: ${tt.subject}`,
      desc: tt.locationOrLink ? `Venue / Link: ${tt.locationOrLink}` : "Fixed commitment",
      type: "fixed" as const,
      isFixed: true,
    }))),
    ...(data.recurringMeetings.slice(0, 1).map((rm) => ({
      time: `${rm.startTime} – ${rm.endTime}`,
      title: `Team Standup: ${rm.title}`,
      desc: `${rm.priority.toUpperCase()} priority work synchronization`,
      type: "fixed" as const,
      isFixed: true,
    }))),
    {
      time: "10:30 – 12:00",
      title: `Deep Focus Block: ${data.shortTermGoal ? data.shortTermGoal.slice(0, 35) + "..." : "Primary Priority Project"}`,
      desc: `Scheduled during your peak focus period (${data.preferredFocusDuration}m sessions)`,
      type: "deep_work" as const,
      isFixed: false,
    },
    {
      time: "12:15 – 13:00",
      title: "Mindful Lunch & Transition Walk",
      desc: "Buffer zone between high-intensity cognitive blocks",
      type: "buffer" as const,
      isFixed: false,
    },
    ...(data.timetable.slice(1, 2).map((tt) => ({
      time: `${tt.startTime} – ${tt.endTime}`,
      title: `Lab / Seminar: ${tt.subject}`,
      desc: tt.locationOrLink || "Coursework session",
      type: "fixed" as const,
      isFixed: true,
    }))),
    {
      time: "15:30 – 16:30",
      title: "Review, Problem Set & Execution Block",
      desc: "Progressive practice without fatigue",
      type: "deep_work" as const,
      isFixed: false,
    },
    {
      time: "17:30 – 18:30",
      title: data.sustainabilityOptIn ? "Eco-Commute / Outdoor Movement" : "Personal Wellness & Exercise",
      desc: "Physical reset after afternoon focus",
      type: "habit" as const,
      isFixed: false,
    },
    {
      time: `21:30 – ${data.sleepTime}`,
      title: "Evening Reflection & Screen-Free Wind Down",
      desc: "Protected recovery zone prior to sleep boundary",
      type: "sleep" as const,
      isFixed: true,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>AI Schedule Generation Complete</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
          Initial Personalized Daily Schedule Preview
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Here is how Kronos organizes a typical high-performance day based on your waking target ({data.wakeTime}), fixed commitments, and {data.preferredFocusDuration}-minute focus sessions.
        </p>
      </div>

      {/* Schedule Timeline Preview */}
      <div className="bg-white rounded-2xl border border-[#e6e3da] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#fdfcf9] border-b border-[#e6e3da] flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span>Sample Schedule for {data.name}</span>
          </span>
          <span className="text-slate-500 font-medium">
            Protected Sleep: {data.sleepTime} PM
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

      {/* Approval Box */}
      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Ready to activate this setup?</span>
          </h4>
          <p className="text-[11px] text-amber-900/80 mt-0.5">
            Approving will customize your active planner, calendar events, and AI assistant profile. You can tweak this anytime from your Profile.
          </p>
        </div>

        <button
          onClick={handleApprove}
          disabled={approving}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all shrink-0 active:scale-98"
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
          className="px-4 py-2.5 rounded-xl border border-[#e6e3da] text-xs font-semibold text-slate-700 hover:bg-[#f5f3ec] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Review</span>
        </button>
      </div>
    </div>
  );
}
