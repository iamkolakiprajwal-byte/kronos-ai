"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/context/demo-context";
import {
  User,
  GraduationCap,
  Briefcase,
  Compass,
  Clock,
  ShieldCheck,
  Leaf,
  Bell,
  Sparkles,
  ArrowRight,
  Bike,
  Footprints,
  Tablet,
  Moon,
  Trees,
  CheckCircle2,
} from "lucide-react";
import { calculateEcoImpact } from "@/lib/sustainability/eco-calculator";

export default function ProfilePage() {
  const { profile, role, setRole, ecoEntries, logEcoActivity } = useDemo();
  const [ecoNotice, setEcoNotice] = useState<string | null>(null);

  const ecoImpact = calculateEcoImpact(ecoEntries);

  const handleQuickLog = (activity: any, minutes: number, label: string) => {
    logEcoActivity(activity, minutes);
    setEcoNotice(`Logged ${label}! Updated your sustainability score.`);
    setTimeout(() => setEcoNotice(null), 4000);
  };

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

        <div className="flex items-center gap-1.5 p-1.5 bg-[#f0ede6] rounded-xl border border-[#e6e3da]">
          <button
            onClick={() => setRole("student")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              role === "student" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>Student</span>
          </button>
          <button
            onClick={() => setRole("professional")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              role === "professional" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pro</span>
          </button>
          <button
            onClick={() => setRole("both")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              role === "both" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Both</span>
          </button>
        </div>
      </div>

      {/* Onboarding Wizard Action Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-slate-900">
              Interactive Setup & Timetable Wizard
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Re-run the guided onboarding flow to reconfigure your biological routine, semester classes, recurring meetings, or target goals.
            </p>
          </div>
        </div>

        <Link
          href="/onboarding"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <span>Launch Onboarding</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
        </Link>
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

      {/* Environmental Sustainability Dashboard */}
      <div className="bg-white rounded-2xl border border-[#e6e3da] p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6]">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
              <Leaf className="w-4 h-4" />
            </span>
            <h3 className="font-serif text-base font-bold text-slate-900">
              Environmental Sustainability & Eco Routine
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Eco Score: {ecoImpact.ecoScore}/100
          </span>
        </div>

        {ecoNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in-50">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{ecoNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              CO₂ Saved
            </span>
            <span className="font-serif text-xl font-bold text-emerald-700 mt-0.5 block">
              {ecoImpact.totalCo2SavedKg} kg
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Trees Equiv.
            </span>
            <span className="font-serif text-xl font-bold text-slate-900 mt-0.5 block flex items-center justify-center gap-1">
              <Trees className="w-4 h-4 text-emerald-600" />
              {ecoImpact.treesEquivalent}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Active Commute
            </span>
            <span className="font-serif text-xl font-bold text-slate-900 mt-0.5 block">
              {ecoImpact.activeCommuteMinutes} min
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Paperless Study
            </span>
            <span className="font-serif text-xl font-bold text-slate-900 mt-0.5 block">
              {ecoImpact.paperlessHours} hrs
            </span>
          </div>
        </div>

        {/* Quick Log Eco Actions */}
        <div className="pt-2 space-y-2">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
            Log Daily Eco Action:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => handleQuickLog("cycle_commute", 30, "30m Cycle Commute")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e6e3da] bg-[#faf9f6] hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 transition-colors"
            >
              <Bike className="w-3.5 h-3.5 text-emerald-600" />
              <span>30m Bicycle Commute</span>
            </button>
            <button
              onClick={() => handleQuickLog("walk_commute", 20, "20m Walking Commute")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e6e3da] bg-[#faf9f6] hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 transition-colors"
            >
              <Footprints className="w-3.5 h-3.5 text-emerald-600" />
              <span>20m Walking Commute</span>
            </button>
            <button
              onClick={() => handleQuickLog("paperless_study", 60, "1 hr Paperless Study")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e6e3da] bg-[#faf9f6] hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 transition-colors"
            >
              <Tablet className="w-3.5 h-3.5 text-emerald-600" />
              <span>1 hr Digital / Paperless Notes</span>
            </button>
            <button
              onClick={() => handleQuickLog("screen_power_down", 60, "Evening Screen Power-Down")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e6e3da] bg-[#faf9f6] hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 transition-colors"
            >
              <Moon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Evening Screen Power-Down</span>
            </button>
            <button
              onClick={() => handleQuickLog("plant_meal", 1, "Plant-Based Meal")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e6e3da] bg-[#faf9f6] hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 transition-colors"
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Plant-Based Meal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Connection Info Card */}
      <div className="bg-white rounded-2xl border border-[#e6e3da] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="font-serif text-sm font-bold text-slate-900">
            Calendar Integration Mode
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Currently running on <span className="font-semibold text-slate-900">MockCalendarAdapter</span> for academic evaluation. No personal Google accounts are connected or modified without explicit OAuth configuration.
        </p>
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900">
          ✓ Two-way sync simulation active with conflict resolution modal in the top header.
        </div>
      </div>
    </div>
  );
}
