"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  TrendingUp,
  Brain,
  Flame,
  Zap,
  RotateCcw,
  Compass,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  Plus,
  Clock,
  Calendar,
  Sparkles,
  BarChart3,
  X,
  ShieldAlert,
  ChevronRight,
  Info,
  Check,
  AlertCircle,
  Target,
  Smile,
  Activity,
  Layers,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { Habit, FocusSessionLog, HabitResetTransition } from "@/types";
import { cn, formatMinutes } from "@/lib/utils";

function GrowthContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "habits";
  const initialTask = searchParams.get("task") || "";

  const [activeTab, setActiveTab] = useState<"habits" | "flow" | "reset" | "insights">(
    (initialTab as any) || "habits"
  );

  const {
    habits,
    toggleHabit,
    addHabit,
    updateHabitAutomaticity,
    focusSessions,
    logDetailedFocusSession,
    habitTransitions,
    addHabitTransition,
    profile,
    role,
  } = useDemo();

  // Habit Creation Modal
  const [isNewHabitOpen, setIsNewHabitOpen] = useState(false);
  const [habitTitle, setHabitTitle] = useState("");
  const [habitCue, setHabitCue] = useState("");
  const [habitContext, setHabitContext] = useState("");
  const [habitMinimumVersion, setHabitMinimumVersion] = useState("");
  const [habitCategory, setHabitCategory] = useState<Habit["category"]>("learning");
  const [habitFrequency, setHabitFrequency] = useState<Habit["frequency"]>("daily");

  // Flow State & Timer
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [interruptionsCount, setInterruptionsCount] = useState(0);

  // Flow Pre-Session Check-in
  const [sessionTaskTitle, setSessionTaskTitle] = useState(initialTask || "");
  const [selectedHabitId, setSelectedHabitId] = useState<string>("");
  const [perceivedChallenge, setPerceivedChallenge] = useState<number>(3); // 1-5
  const [perceivedSkill, setPerceivedSkill] = useState<number>(3); // 1-5
  const [sessionGoal, setSessionGoal] = useState("");
  const [completionCriteria, setCompletionCriteria] = useState("");

  // Flow Post-Session Reflection
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [flowState, setFlowState] = useState<FocusSessionLog["flowState"]>("flow");
  const [absorptionRating, setAbsorptionRating] = useState<number>(4);
  const [concentrationRating, setConcentrationRating] = useState<number>(4);
  const [perceivedControl, setPerceivedControl] = useState<number>(4);
  const [enjoymentRating, setEnjoymentRating] = useState<number>(4);
  const [timeDistortion, setTimeDistortion] = useState<"faster" | "normal" | "slower">("faster");
  const [reflectionNotes, setReflectionNotes] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Habit Reset Transition Modal
  const [isNewTransitionOpen, setIsNewTransitionOpen] = useState(false);
  const [transTitle, setTransTitle] = useState("");
  const [transCategory, setTransCategory] = useState<HabitResetTransition["category"]>("semester");
  const [transDisrupted, setTransDisrupted] = useState("");
  const [transObsolete, setTransObsolete] = useState("");
  const [transHabitName, setTransHabitName] = useState("");
  const [transAnchorCue, setTransAnchorCue] = useState("");
  const [transMinVersion, setTransMinVersion] = useState("");

  // If task provided in URL, switch to flow tab and fill title
  useEffect(() => {
    if (initialTask) {
      setSessionTaskTitle(initialTask);
      setActiveTab("flow");
    }
  }, [initialTask]);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0 && timerRunning) {
      setTimerRunning(false);
      setShowReflectionModal(true);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsLeft]);

  const resetTimer = (mins: number) => {
    setTimerRunning(false);
    setFocusMinutes(mins);
    setSecondsLeft(mins * 60);
    setInterruptionsCount(0);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFinishEarly = () => {
    setTimerRunning(false);
    setShowReflectionModal(true);
  };

  // Flow State Quadrant evaluation
  const getQuadrantLabel = (chal: number, sk: number) => {
    if (chal >= 3 && sk >= 3) return { label: "Flow Channel", desc: "Balanced challenge & skill — optimal immersion", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (chal >= 3 && sk < 3) return { label: "Anxiety / Overwhelm", desc: "Challenge exceeds current perceived capability", color: "text-rose-700 bg-rose-50 border-rose-200" };
    if (chal < 3 && sk >= 3) return { label: "Boredom / Relaxed", desc: "High confidence with lower cognitive demand", color: "text-amber-700 bg-amber-50 border-amber-200" };
    return { label: "Apathy", desc: "Low demand and low engagement", color: "text-slate-600 bg-slate-100 border-slate-200" };
  };

  const currentQuadrant = getQuadrantLabel(perceivedChallenge, perceivedSkill);

  // Save Post-Session Reflection
  const handleSaveReflection = () => {
    const duration = Math.max(1, Math.round((focusMinutes * 60 - secondsLeft) / 60) || focusMinutes);

    logDetailedFocusSession({
      taskTitle: sessionTaskTitle || undefined,
      habitId: selectedHabitId || undefined,
      durationMinutes: duration,
      perceivedChallenge,
      perceivedSkill,
      sessionGoal: sessionGoal || undefined,
      completionCriteria: completionCriteria || undefined,
      interruptionsCount,
      flowState,
      absorptionRating,
      concentrationRating,
      perceivedControl,
      enjoymentRating,
      timeDistortion,
      reflectionNotes: reflectionNotes.trim() || undefined,
    });

    setShowReflectionModal(false);
    resetTimer(focusMinutes);
    setSuccessToast(`Saved ${duration}m ${flowState.toUpperCase()} focus session with reflection!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Create Habit
  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim() || !habitCue.trim()) return;

    addHabit({
      title: habitTitle,
      cue: habitCue,
      context: habitContext || undefined,
      minimumVersion: habitMinimumVersion || undefined,
      category: habitCategory,
      frequency: habitFrequency,
      targetDurationMinutes: 20,
    });

    setHabitTitle("");
    setHabitCue("");
    setHabitContext("");
    setHabitMinimumVersion("");
    setIsNewHabitOpen(false);
    setSuccessToast("New science-backed habit created!");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Create Transition Reset
  const handleCreateTransition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transTitle.trim()) return;

    addHabitTransition({
      title: transTitle,
      category: transCategory,
      startDate: new Date().toISOString().split("T")[0],
      status: "active",
      disruptedRoutines: transDisrupted.split(",").map((s) => s.trim()).filter(Boolean),
      obsoleteCues: transObsolete.split(",").map((s) => s.trim()).filter(Boolean),
      targetHabits: transHabitName
        ? [
            {
              habitName: transHabitName,
              newAnchorCue: transAnchorCue || "Morning tea/coffee",
              minimumVersion: transMinVersion || "2-minute activation",
              status: "in_progress",
            },
          ]
        : [],
      aiObservations: "Life transitions sever habitual associations. Use this disruption window to anchor new 2-minute behaviors before environmental inertia settles.",
    });

    setTransTitle("");
    setTransDisrupted("");
    setTransObsolete("");
    setTransHabitName("");
    setTransAnchorCue("");
    setTransMinVersion("");
    setIsNewTransitionOpen(false);
    setSuccessToast("New life transition reset initialized!");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto animate-in fade-in-50 duration-200">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#e6e3da]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <TrendingUp className="w-4 h-4 text-amber-300" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Growth — Behavior, Flow & Insights
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Csíkszentmihályi Flow Theory • Habit Discontinuity Hypothesis • Non-punitive Automaticity
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 bg-[#f0ede6] rounded-xl self-start sm:self-auto border border-[#e6e3da] overflow-x-auto max-w-full">
          {[
            { id: "habits", label: "Habits", icon: Flame },
            { id: "flow", label: "Flow Theory", icon: Zap },
            { id: "reset", label: "Habit Reset", icon: Compass },
            { id: "insights", label: "Insights", icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap",
                  isActive
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-amber-600" : "text-slate-400")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Notice Toast */}
      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: HABITS */}
      {/* ========================================================================= */}
      {activeTab === "habits" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-[#e6e3da] shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Completed Today</span>
              <div className="text-xl font-bold font-serif text-slate-900 mt-1">
                {habits.filter((h) => h.completedToday).length} of {habits.length}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Contextual cue activation</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e6e3da] shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Avg Automaticity Index</span>
              <div className="text-xl font-bold font-serif text-emerald-700 mt-1">
                {habits.length > 0
                  ? Math.round(
                      habits.reduce((acc, h) => acc + h.automaticityScore, 0) / habits.length
                    )
                  : 0}
                %
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Consistency without streak anxiety</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e6e3da] shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Behavior Design</span>
                <div className="text-sm font-bold text-slate-900 mt-1">2-Minute Activations</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Shrink friction before scaling</p>
              </div>
              <button
                onClick={() => setIsNewHabitOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>New Habit</span>
              </button>
            </div>
          </div>

          {/* Habits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className={cn(
                  "p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5",
                  habit.completedToday
                    ? "bg-white border-emerald-300 shadow-2xs"
                    : "bg-white border-[#e6e3da] hover:border-slate-300"
                )}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                      aria-label={habit.completedToday ? "Mark undone" : "Mark done"}
                    >
                      {habit.completedToday ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <h3
                        className={cn(
                          "text-sm sm:text-base font-semibold truncate",
                          habit.completedToday ? "text-slate-900" : "text-slate-800"
                        )}
                      >
                        {habit.title}
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium uppercase tracking-wider">
                        {habit.category} • {habit.frequency}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 shrink-0">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{habit.currentStreak}d</span>
                  </div>
                </div>

                {/* Anchor Cue & Context Cue */}
                <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded-xl border border-[#e6e3da]/80 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Target className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>
                      <strong className="text-slate-900">Anchor Cue:</strong> "{habit.cue}"
                    </span>
                  </div>
                  {habit.context && (
                    <div className="text-[11px] text-slate-500 pl-5">
                      <strong>Context:</strong> {habit.context}
                    </div>
                  )}
                  {habit.minimumVersion && (
                    <div className="text-[11px] text-emerald-800 font-medium pl-5 bg-emerald-50/60 p-1 rounded-md border border-emerald-100">
                      <strong>2-Min Minimum:</strong> "{habit.minimumVersion}"
                    </div>
                  )}
                </div>

                {/* Automaticity Score Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Automaticity Index</span>
                    <span className="font-bold text-slate-800">{habit.automaticityScore}%</span>
                  </div>
                  <div className="w-full bg-[#f0ede6] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${habit.automaticityScore}%` }}
                    />
                  </div>
                </div>

                {/* 7-Day Completion Heat Dots */}
                <div className="pt-2 border-t border-[#f0ede6] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-medium">Last 7 Days:</span>
                  <div className="flex items-center gap-1.5">
                    {(habit.recentHistory || [false, false, false, false, false, false, false]).map(
                      (completed, idx) => (
                        <div
                          key={idx}
                          title={completed ? "Completed" : "Not logged"}
                          className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center transition-all",
                            completed
                              ? "bg-emerald-600 text-white"
                              : "bg-[#e8e5dc] text-transparent"
                          )}
                        >
                          {completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FLOW (Csíkszentmihályi Flow Theory) */}
      {/* ========================================================================= */}
      {activeTab === "flow" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Flow Pre-Session Check-in Card */}
          <div className="bg-white rounded-2xl border border-[#e6e3da] p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e3da]">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-100 text-amber-900">
                  <Brain className="w-4 h-4" />
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900">
                  Csíkszentmihályi Flow Check-In
                </h3>
              </div>
              <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border", currentQuadrant.color)}>
                {currentQuadrant.label}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Task / Subject</label>
                <input
                  type="text"
                  value={sessionTaskTitle}
                  onChange={(e) => setSessionTaskTitle(e.target.value)}
                  placeholder="e.g. Stanford CS Thesis Proofs, RFC Architecture Review..."
                  className="w-full px-3 py-2 bg-[#faf9f6] border border-[#e6e3da] rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Anchor to Habit (Optional)</label>
                <select
                  value={selectedHabitId}
                  onChange={(e) => setSelectedHabitId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf9f6] border border-[#e6e3da] rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                >
                  <option value="">No specific habit link (Standalone deep work)</option>
                  {habits.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title} (Anchor: "{h.cue}")
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sliders for Challenge vs Skill balance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-3 bg-[#faf9f6] rounded-xl border border-[#e6e3da] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Perceived Challenge</span>
                  <span className="font-mono font-bold text-slate-900">{perceivedChallenge} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={perceivedChallenge}
                  onChange={(e) => setPerceivedChallenge(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1: Trivial</span>
                  <span>3: Balanced</span>
                  <span>5: Formidable</span>
                </div>
              </div>

              <div className="p-3 bg-[#faf9f6] rounded-xl border border-[#e6e3da] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Perceived Skill / Readiness</span>
                  <span className="font-mono font-bold text-slate-900">{perceivedSkill} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={perceivedSkill}
                  onChange={(e) => setPerceivedSkill(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1: Novice</span>
                  <span>3: Proficient</span>
                  <span>5: Master</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Flow state manifests when perceived challenge matches your current skill level, producing effortless attention and distorted sense of passing time.
            </p>
          </div>

          {/* Immersion Timer Hero Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-full uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5" />
                  Immersion Focus Interval
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold">
                  {sessionTaskTitle || "Deep Focus Block"}
                </h2>
                <p className="text-xs text-slate-300 max-w-md">
                  Keep tabs closed, put phone out of sight, and focus on one cognitive objective.
                </p>

                {/* Distraction logger */}
                <div className="pt-2 flex items-center gap-2 justify-center md:justify-start">
                  <button
                    onClick={() => setInterruptionsCount((c) => c + 1)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
                    title="Log an external or self-interruption"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Log Distraction ({interruptionsCount})</span>
                  </button>
                </div>
              </div>

              {/* Timer & Controls */}
              <div className="flex flex-col items-center gap-3 w-full md:w-auto">
                <div className="font-mono text-5xl sm:text-6xl font-bold text-amber-200 tracking-wider">
                  {formatTimer(secondsLeft)}
                </div>

                <div className="flex items-center gap-2.5 flex-wrap justify-center">
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
                  >
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{timerRunning ? "Pause" : "Start Focus"}</span>
                  </button>

                  <button
                    onClick={() => resetTimer(focusMinutes)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Reset timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {timerRunning && (
                    <button
                      onClick={handleFinishEarly}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold transition-colors"
                    >
                      Reflect & Complete
                    </button>
                  )}
                </div>

                {/* Interval Presets */}
                <div className="flex items-center gap-1.5 text-xs">
                  {[20, 25, 45, 50, 90].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => resetTimer(dur)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-mono transition-colors",
                        focusMinutes === dur && !timerRunning
                          ? "bg-amber-300/20 text-amber-200 border border-amber-300/40 font-bold"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Past Focus Sessions Stream */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-bold text-slate-900">
              Flow Reflections History ({focusSessions.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {focusSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-white rounded-2xl border border-[#e6e3da] shadow-2xs text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      {session.durationMinutes}m {session.taskTitle ? `• ${session.taskTitle}` : "Focus"}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                        session.flowState === "flow"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : session.flowState === "balanced"
                          ? "bg-sky-50 text-sky-800 border-sky-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      )}
                    >
                      {session.flowState}
                    </span>
                  </div>

                  {session.reflectionNotes && (
                    <p className="text-slate-600 italic bg-[#faf9f6] p-2 rounded-lg border border-[#e6e3da]/80">
                      "{session.reflectionNotes}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>
                      {session.absorptionRating ? `Absorption: ${session.absorptionRating}/5` : ""}
                      {session.interruptionsCount !== undefined ? ` • ${session.interruptionsCount} distractions` : ""}
                    </span>
                    <span>{session.completedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HABIT RESET (Habit Discontinuity Hypothesis) */}
      {/* ========================================================================= */}
      {activeTab === "reset" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Scientific Foundation Explainer */}
          <div className="bg-[#fcfbf8] border border-[#e6e3da] rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-100 text-amber-900">
                  <Compass className="w-4 h-4 text-amber-700" />
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900">
                  The Habit Discontinuity Hypothesis
                </h3>
              </div>
              <button
                onClick={() => setIsNewTransitionOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>New Life Transition</span>
              </button>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Groundbreaking research by Bas Verplanken and Wendy Wood reveals that everyday habits are sustained by repetitive environmental cues (same bedroom, same transit, same timetable). When a life disruption occurs—such as a <strong>new academic semester</strong>, <strong>new job role</strong>, or <strong>schedule shift</strong>—the old cue triggers disappear. This creates a natural window of heightened neuroplasticity where new productive routines can be adopted without fighting existing inertia.
            </p>
          </div>

          {/* Active Transitions */}
          <div className="space-y-4">
            {habitTransitions.map((trans) => (
              <div
                key={trans.id}
                className="bg-white rounded-2xl border border-[#e6e3da] p-4 sm:p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-base sm:text-lg font-bold text-slate-900">
                        {trans.title}
                      </h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {trans.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Initiated on {trans.startDate} • Category: {trans.category}
                    </p>
                  </div>
                </div>

                {/* Disrupted Routines & Obsolete Cues */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#faf9f6] rounded-xl border border-[#e6e3da] space-y-1">
                    <span className="font-bold text-rose-800 block text-[11px]">
                      Disrupted Old Routines:
                    </span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                      {trans.disruptedRoutines.map((dr, i) => (
                        <li key={i}>{dr}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-[#faf9f6] rounded-xl border border-[#e6e3da] space-y-1">
                    <span className="font-bold text-slate-700 block text-[11px]">
                      Retired Obsolete Cues:
                    </span>
                    <ul className="list-disc list-inside text-slate-500 space-y-0.5 text-[11px]">
                      {trans.obsoleteCues.map((oc, i) => (
                        <li key={i}>{oc}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Replacement Anchor Habits */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-slate-800">
                    New Anchor Habits Installed:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {trans.targetHabits.map((th, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-[#fdfcf9] border border-[#e6e3da] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{th.habitName}</span>
                          <span
                            className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
                              th.status === "established"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-900"
                            )}
                          >
                            {th.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          <strong>Anchor:</strong> "{th.newAnchorCue}"
                        </p>
                        <p className="text-[10px] text-emerald-700">
                          <strong>2-Min Rule:</strong> "{th.minimumVersion}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Behavioral Observation */}
                {trans.aiObservations && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-950 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px] sm:text-xs">
                      {trans.aiObservations}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BEHAVIORAL INSIGHTS */}
      {/* ========================================================================= */}
      {activeTab === "insights" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-[#e6e3da] shadow-2xs space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Deep Work Volume</span>
              <div className="text-xl font-bold font-serif text-slate-900">
                {focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0)} mins
              </div>
              <p className="text-[10px] text-slate-400">Total recorded focus immersion</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e6e3da] shadow-2xs space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Optimal Focus Period</span>
              <div className="text-xl font-bold font-serif text-amber-800 capitalize">
                {profile.mostProductivePeriod}
              </div>
              <p className="text-[10px] text-slate-400">Highest self-reported absorption window</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e6e3da] shadow-2xs space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Active Life Transitions</span>
              <div className="text-xl font-bold font-serif text-emerald-800">
                {habitTransitions.length} Active
              </div>
              <p className="text-[10px] text-slate-400">Habit discontinuity windows leveraged</p>
            </div>
          </div>

          {/* AI Behavioral Observations */}
          <div className="bg-white rounded-2xl border border-[#e6e3da] p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="font-serif text-base font-bold text-slate-900">
                Behavioral Insights & Adaptive Recommendations
              </h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6e3da] space-y-1">
                <span className="font-semibold text-slate-900 block">
                  1. Automaticity Thresholds
                </span>
                <p className="text-slate-600 text-[11px] sm:text-xs">
                  Your highest automaticity habit is <strong>{habits[0]?.title || "Daily Routine"}</strong> at {habits[0]?.automaticityScore || 70}%. Continue pairing new cognitive tasks with existing physical cues ("{habits[0]?.cue || 'morning coffee'}") to minimize willpower depletion.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6e3da] space-y-1">
                <span className="font-semibold text-slate-900 block">
                  2. Distraction Resistance in Deep Work
                </span>
                <p className="text-slate-600 text-[11px] sm:text-xs">
                  Logged sessions indicate that sessions with 0 distractions reported a 4.6/5 absorption rating versus 2.8/5 when interrupted more than 2 times. Protect your 45-minute sprint blocks during your {profile.mostProductivePeriod} window.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6e3da] space-y-1">
                <span className="font-semibold text-slate-900 block">
                  3. Habit Discontinuity Leveraging
                </span>
                <p className="text-slate-600 text-[11px] sm:text-xs">
                  Your current transition ({habitTransitions[0]?.title || "Active Transition"}) is in its peak neuroplastic adaptation window. Maintain the 2-minute activation versions daily to anchor neural pathways before environmental patterns solidify.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: POST-SESSION REFLECTION */}
      {/* ========================================================================= */}
      {showReflectionModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl border-t sm:border border-[#e6e3da] w-full sm:max-w-md p-5 sm:p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="pb-3 border-b border-[#e6e3da]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Flow Theory Check-In
              </span>
              <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 mt-1">
                How Was Your Immersion State?
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Reflecting on challenge vs. skill builds long-term cognitive endurance.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block text-slate-700 font-semibold text-xs">Select Flow State:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "flow", label: "Flow State", sub: "Absorbed attention" },
                  { id: "balanced", label: "Steady Progress", sub: "Comfortable pace" },
                  { id: "boredom", label: "Under-Challenged", sub: "Lacked novelty" },
                  { id: "anxiety", label: "Over-Challenged", sub: "High friction" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFlowState(item.id as any)}
                    className={cn(
                      "p-2.5 rounded-xl border text-left transition-all",
                      flowState === item.id
                        ? "border-slate-900 bg-slate-900 text-white font-bold"
                        : "border-[#e6e3da] bg-[#faf9f6] text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <div className="font-medium text-xs">{item.label}</div>
                    <div className={cn("text-[10px] font-normal mt-0.5", flowState === item.id ? "text-slate-300" : "text-slate-500")}>
                      {item.sub}
                    </div>
                  </button>
                ))}
              </div>

              {/* Time Distortion */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Time Distortion Experience:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "faster", label: "Flew By Fast" },
                    { id: "normal", label: "Normal Pace" },
                    { id: "slower", label: "Dragged Slower" },
                  ].map((td) => (
                    <button
                      key={td.id}
                      type="button"
                      onClick={() => setTimeDistortion(td.id as any)}
                      className={cn(
                        "py-1.5 px-2 rounded-lg border text-center text-[11px] font-medium transition-all",
                        timeDistortion === td.id
                          ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                          : "bg-[#faf9f6] text-slate-600 border-[#e6e3da]"
                      )}
                    >
                      {td.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reflection Note */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Reflection Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Cleared 2 difficult proofs. Phone out of reach was decisive..."
                  value={reflectionNotes}
                  onChange={(e) => setReflectionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e6e3da]">
                <button
                  type="button"
                  onClick={() => setShowReflectionModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleSaveReflection}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all shadow-xs text-xs"
                >
                  Save Reflection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW HABIT */}
      {/* ========================================================================= */}
      {isNewHabitOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl border-t sm:border border-[#e6e3da] w-full sm:max-w-md p-5 sm:p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e3da]">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" />
                <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900">
                  New Science-Backed Habit
                </h3>
              </div>
              <button
                onClick={() => setIsNewHabitOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Habit Behavior</label>
                <input
                  type="text"
                  required
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  placeholder="e.g. Daily Economics Reading, Evening Plan Review..."
                  className="w-full px-3 py-2 bg-[#faf9f6] border border-[#e6e3da] rounded-xl text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Anchor Cue (Existing habit)</label>
                <input
                  type="text"
                  required
                  value={habitCue}
                  onChange={(e) => setHabitCue(e.target.value)}
                  placeholder="e.g. After morning pour-over coffee, Immediately after closing laptop..."
                  className="w-full px-3 py-2 bg-[#faf9f6] border border-[#e6e3da] rounded-xl text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Context / Physical Environment</label>
                <input
                  type="text"
                  value={habitContext}
                  onChange={(e) => setHabitContext(e.target.value)}
                  placeholder="e.g. At study desk with noise-canceling headphones..."
                  className="w-full px-3 py-2 bg-[#faf9f6] border border-[#e6e3da] rounded-xl text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">2-Minute Minimum Version</label>
                <input
                  type="text"
                  value={habitMinimumVersion}
                  onChange={(e) => setHabitMinimumVersion(e.target.value)}
                  placeholder="e.g. Read 1 problem explanation, Write 1 line of outline..."
                  className="w-full px-3 py-2 bg-[#faf9f6] border border-[#e6e3da] rounded-xl text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#faf9f6] border border-[#e6e3da] rounded-xl text-slate-800"
                  >
                    <option value="focus">Focus</option>
                    <option value="learning">Learning</option>
                    <option value="health">Health</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="eco">Eco</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={habitFrequency}
                    onChange={(e) => setHabitFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#faf9f6] border border-[#e6e3da] rounded-xl text-slate-800"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="3x_week">3x per week</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e6e3da]">
                <button
                  type="button"
                  onClick={() => setIsNewHabitOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 shadow-xs"
                >
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE LIFE TRANSITION RESET */}
      {/* ========================================================================= */}
      {isNewTransitionOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl border-t sm:border border-[#e6e3da] w-full sm:max-w-md p-5 sm:p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e3da]">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-700" />
                <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900">
                  New Life Transition Reset
                </h3>
              </div>
              <button
                onClick={() => setIsNewTransitionOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransition} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transition Title</label>
                <input
                  type="text"
                  required
                  value={transTitle}
                  onChange={(e) => setTransTitle(e.target.value)}
                  placeholder="e.g. Fall 2026 Semester, New Senior Eng Role..."
                  className="w-full px-3 py-2 bg-[#faf9f6] border border-[#e6e3da] rounded-xl text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={transCategory}
                  onChange={(e) => setTransCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#faf9f6] border border-[#e6e3da] rounded-xl text-slate-800"
                >
                  <option value="semester">Academic Semester</option>
                  <option value="career">Job / Career Change</option>
                  <option value="relocation">Relocation / Housing</option>
                  <option value="schedule">Schedule / Routine Shift</option>
                  <option value="health">Health / Energy Reset</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Disrupted Routines (comma separated)
                </label>
                <input
                  type="text"
                  value={transDisrupted}
                  onChange={(e) => setTransDisrupted(e.target.value)}
                  placeholder="e.g. Late night library study, 10 AM commute..."
                  className="w-full px-3 py-2 bg-[#faf9f6] border border-[#e6e3da] rounded-xl text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Obsolete Cues to Retire (comma separated)
                </label>
                <input
                  type="text"
                  value={transObsolete}
                  onChange={(e) => setTransObsolete(e.target.value)}
                  placeholder="e.g. Previous dorm desk, old meeting reminders..."
                  className="w-full px-3 py-2 bg-[#faf9f6] border border-[#e6e3da] rounded-xl text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 border-t border-[#f0ede6] space-y-2">
                <span className="font-bold text-slate-800 block text-xs">
                  New Anchor Habit to Install:
                </span>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Habit Name</label>
                  <input
                    type="text"
                    value={transHabitName}
                    onChange={(e) => setTransHabitName(e.target.value)}
                    placeholder="e.g. Morning 20m Deep Problem Solving"
                    className="w-full px-3 py-1.5 bg-[#faf9f6] border border-[#e6e3da] rounded-xl text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Anchor Cue</label>
                    <input
                      type="text"
                      value={transAnchorCue}
                      onChange={(e) => setTransAnchorCue(e.target.value)}
                      placeholder="e.g. After breakfast"
                      className="w-full px-3 py-1.5 bg-[#faf9f6] border border-[#e6e3da] rounded-xl text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">2-Min Rule</label>
                    <input
                      type="text"
                      value={transMinVersion}
                      onChange={(e) => setTransMinVersion(e.target.value)}
                      placeholder="e.g. Read 1 page"
                      className="w-full px-3 py-1.5 bg-[#faf9f6] border border-[#e6e3da] rounded-xl text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e6e3da]">
                <button
                  type="button"
                  onClick={() => setIsNewTransitionOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 shadow-xs"
                >
                  Start Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GrowthPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">
          Loading Growth Workspace...
        </div>
      }
    >
      <GrowthContent />
    </Suspense>
  );
}
