"use client";

import React from "react";
import { useDemo } from "@/context/demo-context";
import {
  User,
  GraduationCap,
  Briefcase,
  Clock,
  ShieldCheck,
  Leaf,
  Bell,
  Cpu,
  Save,
} from "lucide-react";

export default function ProfilePage() {
  const { profile, role, setRole } = useDemo();

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-[#e6e3da]">
        <h1 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
          User Profile & Planning Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Customize your biological waking routine, academic/work constraints, and AI scheduling behavior.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-[#e6e3da] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 shadow-xs"
          />
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-900">{profile.name}</h2>
            <p className="text-xs text-slate-600">{profile.headline}</p>
            <p className="text-xs text-slate-400 mt-0.5">{profile.institutionOrCompany}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-[#f0ede6] rounded-xl border border-[#e6e3da]">
          <button
            onClick={() => setRole("student")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              role === "student" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>Student Mode</span>
          </button>
          <button
            onClick={() => setRole("professional")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              role === "professional" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            <span>Professional Mode</span>
          </button>
        </div>
      </div>

      {/* Routine & Biological Energy Parameters */}
      <div className="bg-white rounded-2xl border border-[#e6e3da] p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-[#f0ede6]">
          <Clock className="w-4 h-4 text-slate-700" />
          <h3 className="font-serif text-base font-bold text-slate-900">
            Daily Biological Routine & Sleep Windows
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6e3da]">
            <span className="text-[11px] text-slate-500 block">Wake-up Time</span>
            <span className="text-sm font-bold text-slate-900 font-mono mt-1 block">
              {profile.wakeTime} AM
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6e3da]">
            <span className="text-[11px] text-slate-500 block">Sleep Target</span>
            <span className="text-sm font-bold text-slate-900 font-mono mt-1 block">
              {profile.sleepTime} PM
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6e3da]">
            <span className="text-[11px] text-slate-500 block">Peak Focus Window</span>
            <span className="text-sm font-bold text-slate-900 capitalize mt-1 block">
              {profile.mostProductivePeriod}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6e3da]">
            <span className="text-[11px] text-slate-500 block">Focus Session Length</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">
              {profile.preferredFocusDuration} min
            </span>
          </div>
        </div>
      </div>

      {/* System & Integrations Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar Connection */}
        <div className="bg-white rounded-2xl border border-[#e6e3da] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-serif text-sm font-bold text-slate-900">
              Calendar Integration Mode
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Currently running on <span className="font-semibold text-slate-900">MockCalendarAdapter</span> for academic evaluation. No personal Google accounts are connected or modified.
          </p>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900">
            ✓ 2-Way Sync Simulation active (Safe sandbox demo)
          </div>
        </div>

        {/* Sustainability Tracking */}
        <div className="bg-white rounded-2xl border border-[#e6e3da] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <h3 className="font-serif text-sm font-bold text-slate-900">
              Environmental Sustainability
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sustainability features enabled: Eco-commute logging (walking/cycling), paperless notes, and mindful energy routine tracking.
          </p>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-900">
            ✓ Eco-Routine Tracking Enabled
          </div>
        </div>
      </div>
    </div>
  );
}
