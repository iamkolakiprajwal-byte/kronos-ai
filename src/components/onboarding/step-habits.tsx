"use client";

import React, { useState } from "react";
import { Sparkles, Flame, Plus, ArrowRight, ArrowLeft } from "lucide-react";

interface StepHabitsProps {
  data: {
    existingHabits: string[];
    desiredHabits: string[];
  };
  onChange: (fields: Partial<StepHabitsProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepHabits({ data, onChange, onNext, onBack }: StepHabitsProps) {
  const [newExisting, setNewExisting] = useState("");
  const [newDesired, setNewDesired] = useState("");

  const handleAddExisting = () => {
    if (!newExisting.trim()) return;
    if (!data.existingHabits.includes(newExisting.trim())) {
      onChange({ existingHabits: [...data.existingHabits, newExisting.trim()] });
    }
    setNewExisting("");
  };

  const handleAddDesired = () => {
    if (!newDesired.trim()) return;
    if (!data.desiredHabits.includes(newDesired.trim())) {
      onChange({ desiredHabits: [...data.desiredHabits, newDesired.trim()] });
    }
    setNewDesired("");
  };

  const handleRemoveExisting = (item: string) => {
    onChange({ existingHabits: data.existingHabits.filter((h) => h !== item) });
  };

  const handleRemoveDesired = (item: string) => {
    onChange({ desiredHabits: data.desiredHabits.filter((h) => h !== item) });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
            Habit Formation & Behavioral Cues
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Rooted in behavioral science: We pair desired behaviors with existing anchor cues instead of relying solely on raw willpower.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e6e3da] p-6 shadow-xs space-y-6">
        {/* Existing Habits */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Current Consistent Habits (Anchors)
          </label>
          <p className="text-[11px] text-slate-500 mb-2">
            Routines you already do naturally (e.g. Morning pour-over coffee, evening stretch, opening laptop at 9 AM).
          </p>

          <div className="flex items-center gap-2 mb-2.5">
            <input
              type="text"
              value={newExisting}
              onChange={(e) => setNewExisting(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddExisting();
                }
              }}
              placeholder="e.g. Morning pour-over coffee, 15-min walk"
              className="flex-1 px-3 py-2 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={handleAddExisting}
              className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {data.existingHabits.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-xs font-medium"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveExisting(item)}
                  className="text-slate-400 hover:text-rose-600 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Desired Habits */}
        <div className="pt-2 border-t border-[#f0ede6]">
          <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Habits You Want to Build</span>
          </label>
          <p className="text-[11px] text-slate-500 mb-2">
            Behaviors you want to nurture into automatic routines without streak-shame.
          </p>

          <div className="flex items-center gap-2 mb-2.5">
            <input
              type="text"
              value={newDesired}
              onChange={(e) => setNewDesired(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddDesired();
                }
              }}
              placeholder="e.g. 50-minute deep study pomodoro, reading 20 min"
              className="flex-1 px-3 py-2 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={handleAddDesired}
              className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {data.desiredHabits.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDesired(item)}
                  className="text-amber-600 hover:text-rose-600 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
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
          <span>Continue</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
        </button>
      </div>
    </div>
  );
}
