"use client";

import React from "react";
import { Leaf, Bike, BookOpen, Droplets, Zap, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepSustainabilityProps {
  data: {
    sustainabilityOptIn: boolean;
    ecoActivities: string[];
  };
  onChange: (fields: Partial<StepSustainabilityProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ecoOptions = [
  {
    id: "Walking/Cycling to lectures",
    label: "Walking or Cycling Commute",
    desc: "Incorporate active, zero-emission travel between dorms, campus, or office.",
    icon: Bike,
  },
  {
    id: "Paperless note-taking on tablet",
    label: "Zero-Paper Digital Workflows",
    desc: "Digital annotation and specs to eliminate disposable paper waste.",
    icon: BookOpen,
  },
  {
    id: "Reusable bottle & zero single-use",
    label: "Hydration & Waste Mindfulness",
    desc: "Anchor daily hydration with reusable vessels and reduced single-use plastics.",
    icon: Droplets,
  },
  {
    id: "Energy-conscious compute & shutdown",
    label: "Mindful Power Consumption",
    desc: "Intentional power downs and energy mindfulness during peak grid hours.",
    icon: Zap,
  },
];

export function StepSustainability({
  data,
  onChange,
  onNext,
  onBack,
}: StepSustainabilityProps) {
  const toggleActivity = (act: string) => {
    if (data.ecoActivities.includes(act)) {
      onChange({ ecoActivities: data.ecoActivities.filter((a) => a !== act) });
    } else {
      onChange({ ecoActivities: [...data.ecoActivities, act] });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Leaf className="w-5 h-5 text-emerald-600" />
          <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
            Environmental Sustainability (Optional)
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Optionally weave sustainable routines into your schedule. No exaggerated carbon claims—just practical mindfulness.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e6e3da] p-6 shadow-xs space-y-6">
        {/* Opt-in Toggle */}
        <label className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 cursor-pointer">
          <div>
            <span className="text-xs font-bold text-emerald-950 block">
              Enable Sustainability Routine Tracking
            </span>
            <span className="text-[11px] text-emerald-800 leading-normal block mt-0.5">
              Include eco-conscious habits (walking, transit, paperless study) in your planner view.
            </span>
          </div>
          <input
            type="checkbox"
            checked={data.sustainabilityOptIn}
            onChange={(e) => onChange({ sustainabilityOptIn: e.target.checked })}
            className="w-4 h-4 rounded-sm text-emerald-600 border-emerald-300 focus:ring-emerald-500"
          />
        </label>

        {data.sustainabilityOptIn && (
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-semibold text-slate-800">
              Select Eco-Mindful Habits to Track
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ecoOptions.map((opt) => {
                const Icon = opt.icon;
                const isChecked = data.ecoActivities.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleActivity(opt.id)}
                    className={cn(
                      "p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3",
                      isChecked
                        ? "bg-emerald-50/50 border-emerald-600 shadow-2xs"
                        : "bg-[#faf9f6] border-[#e6e3da] hover:bg-white"
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        isChecked
                          ? "bg-emerald-700 text-white"
                          : "bg-white text-slate-500 border border-[#e6e3da]"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                        {opt.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNext}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Skip this step
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <span>Review Profile</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
