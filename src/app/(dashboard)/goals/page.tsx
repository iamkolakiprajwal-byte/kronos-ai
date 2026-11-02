"use client";

import React, { useState } from "react";
import { useDemo } from "@/context/demo-context";
import { Target, Sparkles, CheckCircle2, Circle, Plus, Calendar, Compass, ArrowRight } from "lucide-react";

export default function GoalsPage() {
  const { goals, role } = useDemo();
  const [activeTab, setActiveTab] = useState<"all" | "academic" | "career" | "skills">("all");
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [roadmapSuccess, setRoadmapSuccess] = useState(false);

  const handleSimulateRoadmap = () => {
    setGeneratingRoadmap(true);
    setTimeout(() => {
      setGeneratingRoadmap(false);
      setRoadmapSuccess(true);
      setTimeout(() => setRoadmapSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e3da]">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
            Goals & Strategic Roadmaps
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Break multi-week goals down into realistic milestones and daily schedule blocks.
          </p>
        </div>

        <button
          onClick={handleSimulateRoadmap}
          disabled={generatingRoadmap}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xs hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{generatingRoadmap ? "Decomposing Roadmap..." : "Generate AI Roadmap"}</span>
        </button>
      </div>

      {roadmapSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in-50">
          <span>
            ✓ AI has analyzed your timeline and generated 3 realistic milestone checkpoints with scheduled study blocks!
          </span>
        </div>
      )}

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="bg-white rounded-2xl border border-[#e6e3da] p-6 shadow-xs flex flex-col justify-between space-y-5"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                  {goal.category}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Target: {goal.targetDate}
                </span>
              </div>

              <h3 className="font-serif text-lg font-bold text-slate-900">{goal.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{goal.description}</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Completion Progress</span>
                <span className="font-bold text-slate-900">{goal.progress}%</span>
              </div>
              <div className="w-full bg-[#f0ede6] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-slate-900 h-full rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>

            {/* Milestones Checklist */}
            <div className="pt-3 border-t border-[#f0ede6] space-y-2.5">
              <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                Milestone Checkpoints ({goal.milestones.filter((m) => m.completed).length}/
                {goal.milestones.length})
              </span>
              <div className="space-y-2">
                {goal.milestones.map((ms) => (
                  <div
                    key={ms.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#faf9f6] border border-[#e6e3da]/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {ms.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span
                        className={ms.completed ? "line-through text-slate-400" : "text-slate-800"}
                      >
                        {ms.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {ms.dueDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
