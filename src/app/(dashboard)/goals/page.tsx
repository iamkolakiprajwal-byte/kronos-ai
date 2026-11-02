"use client";

import React, { useState } from "react";
import { useDemo } from "@/context/demo-context";
import {
  Target,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  Compass,
  ArrowRight,
  Clock,
  Layers,
  Check,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { Goal, Priority } from "@/types";

export default function GoalsPage() {
  const {
    goals,
    role,
    toggleMilestone,
    addGoal,
    updateGoalRoadmap,
    addMilestoneTaskToAgenda,
  } = useDemo();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [decomposingGoalId, setDecomposingGoalId] = useState<string | null>(null);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // New Goal Modal State
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<Goal["category"]>("academic");
  const [newTargetDate, setNewTargetDate] = useState("2026-12-15");
  const [newPriority, setNewPriority] = useState<Priority>("high");

  const categories = [
    { id: "all", label: "All Horizons" },
    { id: "academic", label: "Academic" },
    { id: "career", label: "Career & Work" },
    { id: "skills", label: "Creative & Skills" },
    { id: "wellness", label: "Wellness & Health" },
    { id: "sustainability", label: "Eco & Green" },
  ];

  const filteredGoals =
    activeTab === "all" ? goals : goals.filter((g) => g.category === activeTab);

  const handleDecomposeWithAI = async (goal: Goal) => {
    setDecomposingGoalId(goal.id);
    try {
      const res = await fetch("/api/goals/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: goal.title,
          description: goal.description,
          category: goal.category,
          targetDate: goal.targetDate,
          role,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.milestones && data.milestones.length > 0) {
          updateGoalRoadmap(goal.id, data.milestones);
          setExpandedGoalId(goal.id);
          setSuccessNotice(
            `AI decomposed "${goal.title}" into ${data.milestones.length} actionable phases!`
          );
          setTimeout(() => setSuccessNotice(null), 5000);
        }
      }
    } catch (err) {
      console.error("Failed to decompose goal:", err);
    } finally {
      setDecomposingGoalId(null);
    }
  };

  const handleScheduleTask = (taskTitle: string, duration: number, difficulty: string) => {
    addMilestoneTaskToAgenda({
      title: taskTitle,
      description: `Actionable milestone block (${difficulty} focus)`,
      category: role === "student" ? "study" : "work",
      priority: "high",
      status: "todo",
      estimatedDuration: duration,
      scheduledDate: new Date().toISOString().split("T")[0],
      isFixed: false,
      tag: "Roadmap Task",
      energyLevel: difficulty === "high" ? "high" : "medium",
    });

    setSuccessNotice(`Scheduled "${taskTitle}" into today's agenda!`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addGoal({
      title: newTitle.trim(),
      description: newDescription.trim() || "Target strategic milestone.",
      category: newCategory,
      targetDate: newTargetDate,
      priority: newPriority,
      milestones: [
        {
          id: `ms-${Date.now()}-1`,
          title: "Phase 1: Foundation and Initial Scoping",
          dueDate: "Sprint 1",
          completed: false,
        },
        {
          id: `ms-${Date.now()}-2`,
          title: "Phase 2: Core Execution and Implementation",
          dueDate: "Sprint 2",
          completed: false,
        },
        {
          id: `ms-${Date.now()}-3`,
          title: "Phase 3: Final Review and Goal Attainment",
          dueDate: newTargetDate,
          completed: false,
        },
      ],
    });

    setNewTitle("");
    setNewDescription("");
    setIsNewGoalModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e3da]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-900">
              <Compass className="w-4 h-4" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
              Strategic Goals & AI Roadmaps
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Decompose long-term ambitions into structured checkpoints, actionable daily tasks, and protected study blocks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewGoalModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e6e3da] text-slate-800 text-xs font-semibold hover:bg-slate-50 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === cat.id
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-[#e6e3da] hover:bg-slate-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGoals.map((goal) => {
          const isDecomposing = decomposingGoalId === goal.id;
          const completedCount = goal.milestones.filter((m) => m.completed).length;

          return (
            <div
              key={goal.id}
              className="bg-white rounded-2xl border border-[#e6e3da] p-6 shadow-xs flex flex-col justify-between space-y-5 transition-all hover:border-slate-300"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                    {goal.category}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
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
              <div className="pt-3 border-t border-[#f0ede6] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                    Milestones ({completedCount}/{goal.milestones.length})
                  </span>

                  <button
                    onClick={() => handleDecomposeWithAI(goal)}
                    disabled={isDecomposing}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200/80 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>{isDecomposing ? "Decomposing..." : "AI Breakdown"}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {goal.milestones.map((ms) => (
                    <div
                      key={ms.id}
                      className="rounded-xl bg-[#faf9f6] border border-[#e6e3da]/80 p-2.5 text-xs space-y-2 transition-all hover:bg-amber-50/20"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => toggleMilestone(goal.id, ms.id)}
                          className="flex items-center gap-2 text-left group"
                        >
                          {ms.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0" />
                          )}
                          <span
                            className={
                              ms.completed
                                ? "line-through text-slate-400 font-medium"
                                : "text-slate-800 font-medium"
                            }
                          >
                            {ms.title}
                          </span>
                        </button>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                          {ms.dueDate}
                        </span>
                      </div>

                      {/* Actionable Daily Tasks if decomposed by AI */}
                      {ms.actionableTasks && ms.actionableTasks.length > 0 && (
                        <div className="pt-2 border-t border-[#e6e3da]/60 space-y-1.5 pl-6">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Daily Action Blocks:
                          </span>
                          {ms.actionableTasks.map((at) => (
                            <div
                              key={at.id}
                              className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white border border-[#e6e3da] text-[11px]"
                            >
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                                <span className="text-slate-800">{at.title}</span>
                                <span className="text-[9px] font-medium px-1 rounded bg-slate-100 text-slate-600">
                                  {at.durationMinutes}m
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  handleScheduleTask(at.title, at.durationMinutes, at.difficulty)
                                }
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-medium hover:bg-slate-800 shrink-0"
                              >
                                <Plus className="w-2.5 h-2.5" />
                                <span>Schedule</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Goal Modal */}
      {isNewGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-2xl border border-[#e6e3da] w-full max-w-md p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e3da]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-800" />
                <h3 className="font-serif text-lg font-bold text-slate-900">Define Strategic Goal</h3>
              </div>
              <button
                onClick={() => setIsNewGoalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Econometrics & Pass Final Exam with A+"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description / Target Outcome</label>
                <textarea
                  rows={2}
                  placeholder="Briefly state why this goal matters and what success looks like..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Horizon Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="academic">Academic</option>
                    <option value="career">Career & Work</option>
                    <option value="skills">Creative & Skills</option>
                    <option value="wellness">Wellness & Health</option>
                    <option value="sustainability">Eco & Green</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Target Date</label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e6e3da]">
                <button
                  type="button"
                  onClick={() => setIsNewGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all shadow-xs"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
