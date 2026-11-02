"use client";

import React from "react";
import { GraduationCap, Briefcase, Compass, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";

interface StepUserTypeProps {
  value: UserRole;
  onChange: (val: UserRole) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepUserType({ value, onChange, onNext, onBack }: StepUserTypeProps) {
  const options = [
    {
      id: "student" as UserRole,
      title: "Student",
      subtitle: "Academic Focus",
      icon: GraduationCap,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      description:
        "Manage university/college lectures, assignments, exams, and dedicated study blocks around campus life.",
      tags: ["Course Timetable", "Assignment Deadlines", "Exam Prep"],
    },
    {
      id: "professional" as UserRole,
      title: "Working Professional",
      subtitle: "Career & Execution",
      icon: Briefcase,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      description:
        "Protect deep work blocks from meeting overflow, manage recurring standups, and advance career projects.",
      tags: ["Work Hours", "Meeting Blocks", "Project Milestones"],
    },
    {
      id: "both" as UserRole,
      title: "Dual Track (Both)",
      subtitle: "Work & Academic Study",
      icon: Compass,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      description:
        "Balancing evening or graduate classes with daytime professional shifts or freelance engagements.",
      tags: ["Shift Synchronization", "Lectures + Standups", "Split Focus"],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div>
        <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
          How will you be using Kronos?
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Select your primary rhythm. We will tailor your timetable options and scheduling constraints accordingly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={cn(
                "p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left relative group",
                isSelected
                  ? "bg-white border-slate-900 shadow-sm ring-2 ring-slate-900/10"
                  : "bg-white border-[#e6e3da] hover:border-slate-400 hover:bg-[#fcfbf8]"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border", opt.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  {opt.subtitle}
                </span>
                <h3 className="font-serif text-base font-bold text-slate-900">{opt.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{opt.description}</p>
              </div>

              <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-[#f0ede6]">
                {opt.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="pt-4 flex items-center justify-between border-t border-[#e6e3da]">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-[#e6e3da] text-xs font-semibold text-slate-700 hover:bg-[#f5f3ec] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
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
