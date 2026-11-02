"use client";

import React from "react";
import { Clock, Sparkles, Calendar, ShieldCheck, Heart, ArrowRight } from "lucide-react";

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="space-y-6 text-center sm:text-left animate-in fade-in-50 duration-200">
      {/* Brand Icon & Heading */}
      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-200 flex items-center justify-center mx-auto sm:mx-0 shadow-xs">
        <Clock className="w-6 h-6 text-amber-300" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-semibold border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Intelligent Personal Time Assistant</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Welcome to Kronos AI
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
          More than a calendar or to-do list. Kronos learns your waking routines, academic commitments, workplace deadlines, and habits to organize your days realistically.
        </p>
      </div>

      {/* Philosophy Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
        <div className="p-4 rounded-xl bg-white border border-[#e6e3da] text-left space-y-1 shadow-xs">
          <Calendar className="w-4 h-4 text-blue-600 mb-1" />
          <h3 className="text-xs font-bold text-slate-900">Adaptive Planning</h3>
          <p className="text-[11px] text-slate-500 leading-normal">
            Schedules that dynamically adapt when morning sessions run late or emergencies arise.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#e6e3da] text-left space-y-1 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
          <h3 className="text-xs font-bold text-slate-900">Deterministic Engine</h3>
          <p className="text-[11px] text-slate-500 leading-normal">
            No hallucinated AI overlaps. Fixed lectures and team standups are strictly protected.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#e6e3da] text-left space-y-1 shadow-xs">
          <Heart className="w-4 h-4 text-amber-600 mb-1" />
          <h3 className="text-xs font-bold text-slate-900">Habits Without Guilt</h3>
          <p className="text-[11px] text-slate-500 leading-normal">
            Evidence-backed behavioral cues, automaticity tracking, and focus intervals.
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={onNext}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all"
        >
          <span>Get Started (takes ~2 minutes)</span>
          <ArrowRight className="w-4 h-4 text-amber-300" />
        </button>
      </div>
    </div>
  );
}
