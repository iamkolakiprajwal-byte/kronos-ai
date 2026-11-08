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
  Sparkles,
  BarChart3,
  X,
  ShieldAlert,
  Info,
  Check,
  AlertCircle,
  Target,
  ArrowRight,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { Habit, FocusSessionLog, HabitResetTransition } from "@/types";
import { cn } from "@/lib/utils";

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
    setHabitSelfReportedAutomaticity,
    focusSessions,
    habitTransitions,
    addHabitTransition,
    profile,
    referenceDate,
    timerState,
    startFocusTimer,
    pauseFocusTimer,
    resumeFocusTimer,
    resetFocusTimer,
    logTimerInterruption,
    finishTimerEarly,
    completeTimerSession,
    dismissTimerCompletion,
    updateTimerChallengeSkill,
  } = useDemo();

  // Habit Creation Modal
  const [isNewHabitOpen, setIsNewHabitOpen] = useState(false);
  const [habitTitle, setHabitTitle] = useState("");
  const [habitCue, setHabitCue] = useState("");
  const [habitContext, setHabitContext] = useState("");
  const [habitMinimumVersion, setHabitMinimumVersion] = useState("");
  const [habitCategory, setHabitCategory] = useState<Habit["category"]>("learning");
  const [habitFrequency, setHabitFrequency] = useState<Habit["frequency"]>("daily");

  // Flow Post-Session Reflection Modal
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

  // If task provided in URL, update context timer state and switch to flow tab
  useEffect(() => {
    if (initialTask && initialTask !== timerState.taskTitle) {
      updateTimerChallengeSkill(
        timerState.perceivedChallenge,
        timerState.perceivedSkill,
        timerState.sessionGoal,
        timerState.completionCriteria,
        initialTask,
        timerState.habitId
      );
      setActiveTab("flow");
    }
  }, [initialTask]);

  // When context timer finishes naturally or user finishes early, trigger reflection modal
  useEffect(() => {
    if (timerState.sessionCompleted) {
      setShowReflectionModal(true);
    }
  }, [timerState.sessionCompleted]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggleTimer = () => {
    if (timerState.isRunning) {
      pauseFocusTimer();
    } else {
      if (timerState.secondsLeft < timerState.totalMinutes * 60 && timerState.secondsLeft > 0) {
        resumeFocusTimer();
      } else {
        startFocusTimer({
          totalMinutes: timerState.totalMinutes,
          taskTitle: timerState.taskTitle,
          habitId: timerState.habitId,
          perceivedChallenge: timerState.perceivedChallenge,
          perceivedSkill: timerState.perceivedSkill,
          sessionGoal: timerState.sessionGoal,
          completionCriteria: timerState.completionCriteria,
        });
      }
    }
  };

  // Flow State Quadrant evaluation based on Csíkszentmihályi Flow Model
  const getQuadrantLabel = (chal: number, sk: number) => {
    if (chal >= 3 && sk >= 3) {
      return {
        label: "Flow Channel",
        desc: "Balanced challenge & skill — optimal immersion",
        color: "text-[#536b54] bg-[#edf2ec] border-[#d6e0d5]",
      };
    }
    if (chal >= 3 && sk < 3) {
      return {
        label: "Anxiety / Overwhelm",
        desc: "Challenge exceeds current perceived capability",
        color: "text-[#b85437] bg-[#faece7] border-[#f3cec3]",
      };
    }
    if (chal < 3 && sk >= 3) {
      return {
        label: "Boredom / Relaxed",
        desc: "High confidence with lower cognitive demand",
        color: "text-[#9c631e] bg-[#faf0e1] border-[#eedac0]",
      };
    }
    return {
      label: "Apathy",
      desc: "Low demand and low engagement",
      color: "text-[#545049] bg-[#f2eee6] border-[#e4ded2]",
    };
  };

  const currentQuadrant = getQuadrantLabel(
    timerState.perceivedChallenge,
    timerState.perceivedSkill
  );

  // Save Post-Session Reflection
  const handleSaveReflection = () => {
    completeTimerSession({
      flowState,
      absorptionRating,
      concentrationRating,
      perceivedControl,
      enjoymentRating,
      timeDistortion,
      reflectionNotes: reflectionNotes.trim() || undefined,
    });

    setShowReflectionModal(false);
    setReflectionNotes("");
    setSuccessToast(`Saved focus session reflection (${flowState.toUpperCase()})!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleDismissReflection = () => {
    dismissTimerCompletion();
    setShowReflectionModal(false);
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

  // Create Life Transition Reset
  const handleCreateTransition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transTitle.trim()) return;

    const disrupted = transDisrupted
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const obsolete = transObsolete
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    addHabitTransition({
      title: transTitle,
      startDate: referenceDate || new Date().toISOString().split("T")[0],
      category: transCategory,
      status: "active",
      disruptedRoutines: disrupted.length > 0 ? disrupted : ["Old routine schedules"],
      obsoleteCues: obsolete.length > 0 ? obsolete : ["Previous physical environment"],
      targetHabits: transHabitName.trim()
        ? [
            {
              habitName: transHabitName.trim(),
              newAnchorCue: transAnchorCue.trim() || "After daily routine initiation",
              minimumVersion: transMinVersion.trim() || "2-minute activation action",
              status: "in_progress",
            },
          ]
        : [],
      aiObservations:
        "Life transitions sever habitual associations. Use this disruption window to anchor new 2-minute behaviors before environmental inertia settles.",
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

  // Empirical analytics calculations for Insights tab
  const mostConsistentHabit =
    habits.length > 0
      ? [...habits].sort(
          (a, b) =>
            (b.weeklyCompletionRate ?? (b.recentHistory?.filter(Boolean).length || 0)) -
            (a.weeklyCompletionRate ?? (a.recentHistory?.filter(Boolean).length || 0))
        )[0]
      : null;

  const zeroInterruptionSessions = focusSessions.filter(
    (s) => (s.interruptionsCount || 0) === 0 && s.absorptionRating !== undefined
  );
  const interruptedSessions = focusSessions.filter(
    (s) => (s.interruptionsCount || 0) > 0 && s.absorptionRating !== undefined
  );

  const avgZero =
    zeroInterruptionSessions.length > 0
      ? (
          zeroInterruptionSessions.reduce((acc, s) => acc + (s.absorptionRating || 0), 0) /
          zeroInterruptionSessions.length
        ).toFixed(1)
      : null;

  const avgInterrupted =
    interruptedSessions.length > 0
      ? (
          interruptedSessions.reduce((acc, s) => acc + (s.absorptionRating || 0), 0) /
          interruptedSessions.length
        ).toFixed(1)
      : null;

  const activeTransition =
    habitTransitions.find((t) => t.status === "active") || habitTransitions[0];

  const timerProgress =
    timerState.totalMinutes > 0
      ? 1 - timerState.secondsLeft / (timerState.totalMinutes * 60)
      : 0;

  return (
    <div className="space-y-7 sm:space-y-10 max-w-4xl mx-auto animate-in fade-in-50 duration-200 pb-16 md:pb-12">
      {/* Workspace Header Briefing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#e8e2d5]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#201e1b] text-[#f8f6f0] flex items-center justify-center shrink-0 shadow-2xs">
              <TrendingUp className="w-4 h-4 text-[#e8decb]" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-normal text-[#201e1b] tracking-tight">
              Growth — Behavior, Flow & Insights
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-[#8a8479] mt-0.5">
            Csíkszentmihályi Flow Theory • Habit Discontinuity Hypothesis • Non-punitive Automaticity
          </p>
        </div>

        {/* Top Tab Segmented Pill Control (Does not fight bottom nav) */}
        <div className="flex items-center gap-1 p-1 bg-[#f2eee6] rounded-2xl self-start sm:self-auto border border-[#e8e2d5] overflow-x-auto max-w-full shadow-2xs">
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
                  "px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer",
                  isActive
                    ? "bg-[#201e1b] text-[#f8f6f0] shadow-2xs font-semibold"
                    : "text-[#545049] hover:text-[#201e1b]"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#e8decb]" : "text-[#8a8479]")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Notice Toast */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-[#edf2ec] border border-[#d6e0d5] text-xs text-[#536b54] flex items-center gap-2 animate-in fade-in-50 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-[#536b54] shrink-0" />
          <span className="font-medium">{successToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: HABITS */}
      {/* ========================================================================= */}
      {activeTab === "habits" && (
        <div className="space-y-6 animate-in fade-in-50 duration-150">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-[#e8e2d5] shadow-2xs">
              <span className="text-[11px] text-[#8a8479] font-medium uppercase tracking-wider">Completed Today</span>
              <div className="text-2xl font-serif font-normal text-[#201e1b] mt-1">
                {habits.filter((h) => h.completedToday).length} of {habits.length}
              </div>
              <p className="text-[10px] text-[#8a8479] mt-0.5">Contextual cue activation</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e8e2d5] shadow-2xs">
              <span className="text-[11px] text-[#8a8479] font-medium uppercase tracking-wider">7-Day Completion</span>
              <div className="text-2xl font-serif font-normal text-[#536b54] mt-1">
                {habits.length > 0
                  ? Math.round(
                      habits.reduce(
                        (acc, h) =>
                          acc +
                          (h.weeklyCompletionRate ??
                            Math.round(((h.recentHistory?.filter(Boolean).length || 0) / 7) * 100)),
                        0
                      ) / habits.length
                    )
                  : 0}
                %
              </div>
              <p className="text-[10px] text-[#8a8479] mt-0.5">Empirical weekly completion adherence</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e8e2d5] shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#8a8479] font-medium uppercase tracking-wider">Behavior Design</span>
                <div className="text-sm font-semibold text-[#201e1b] mt-1">2-Minute Activations</div>
                <p className="text-[10px] text-[#8a8479] mt-0.5">Shrink friction before scaling</p>
              </div>
              <button
                onClick={() => setIsNewHabitOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] font-medium text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#e8decb]" />
                <span>New Habit</span>
              </button>
            </div>
          </div>

          {/* Habits Grid or Empty State */}
          {habits.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#e8e2d5] text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-[#f2eee6] text-[#b85437] flex items-center justify-center mx-auto shadow-2xs">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-normal text-[#201e1b]">No Habits Established Yet</h3>
              <p className="text-xs text-[#8a8479] max-w-sm mx-auto leading-relaxed">
                Build atomic daily routines anchored to reliable cues with 2-minute starter versions to build automaticity.
              </p>
              <button
                type="button"
                onClick={() => setIsNewHabitOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#201e1b] text-white text-xs font-medium hover:bg-[#38342f] cursor-pointer shadow-2xs transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-[#e8decb]" />
                <span>Create Your First Habit</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habits.map((habit) => (
              <div
                key={habit.id}
                className={cn(
                  "p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5",
                  habit.completedToday
                    ? "bg-[#fdfcf9] border-[#d6e0d5] shadow-2xs"
                    : "bg-white border-[#e8e2d5] hover:border-[#d5cdbd] shadow-2xs"
                )}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className="mt-0.5 text-[#8a8479] hover:text-[#536b54] transition-colors shrink-0 cursor-pointer"
                      aria-label={habit.completedToday ? "Mark undone" : "Mark done"}
                    >
                      {habit.completedToday ? (
                        <CheckCircle2 className="w-5 h-5 text-[#536b54] fill-[#edf2ec]" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#d5cdbd]" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <h3
                        className={cn(
                          "font-serif text-base sm:text-lg font-normal truncate",
                          habit.completedToday ? "text-[#8a8479] line-through" : "text-[#201e1b]"
                        )}
                      >
                        {habit.title}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2eee6] text-[#545049] font-medium uppercase tracking-wider border border-[#e4ded2]">
                        {habit.category} • {habit.frequency}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-[#b85437] bg-[#faece7] px-2.5 py-1 rounded-xl border border-[#f3cec3] shrink-0 font-mono">
                    <Flame className="w-3.5 h-3.5 fill-[#b85437]" />
                    <span>{habit.currentStreak}d</span>
                  </div>
                </div>

                {/* Anchor Cue & Context Cue */}
                <div className="bg-[#f7f5f0] p-3 rounded-xl border border-[#e8e2d5] text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#545049]">
                    <Target className="w-3.5 h-3.5 text-[#b85437] shrink-0" />
                    <span>
                      <strong className="text-[#201e1b]">Anchor Cue:</strong> "{habit.cue}"
                    </span>
                  </div>
                  {habit.context && (
                    <div className="text-[11px] text-[#8a8479] pl-5">
                      <strong>Context:</strong> {habit.context}
                    </div>
                  )}
                  {habit.minimumVersion && (
                    <div className="text-[11px] text-[#536b54] font-medium pl-5 bg-[#edf2ec]/60 p-1.5 rounded-lg border border-[#d6e0d5]">
                      <strong>2-Min Minimum:</strong> "{habit.minimumVersion}"
                    </div>
                  )}
                </div>

                {/* Behavioral Metrics (Separate Completion, Cue Consistency, and Self-Reported Automaticity) */}
                <div className="space-y-2 pt-1 border-t border-[#f2eee6]">
                  {/* 1. 7-Day Completion Rate */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8a8479]">7-Day Completion:</span>
                    <span className="font-semibold text-[#201e1b] font-mono">
                      {habit.weeklyCompletionRate ?? Math.round(((habit.recentHistory?.filter(Boolean).length || 0) / 7) * 100)}% ({habit.recentHistory?.filter(Boolean).length || 0}/7 days)
                    </span>
                  </div>

                  {/* 2. Anchor Cue Consistency */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8a8479]">Anchor Cue Consistency:</span>
                    <span className="font-semibold text-[#536b54] font-mono">
                      {habit.cueConsistencyScore ?? 85}%
                    </span>
                  </div>

                  {/* 3. Optional Self-Reported Automaticity (SRHI Scale 1-5) */}
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className="text-[#8a8479] flex items-center gap-1">
                      <span>Self-Reported Automaticity:</span>
                      <strong className="text-[#201e1b] font-mono font-medium">
                        {habit.selfReportedAutomaticity || 3}/5
                      </strong>
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setHabitSelfReportedAutomaticity(habit.id, lvl)}
                          className={cn(
                            "w-5 h-5 rounded text-[10px] font-mono flex items-center justify-center transition-colors cursor-pointer",
                            (habit.selfReportedAutomaticity || 3) >= lvl
                              ? "bg-[#536b54] text-white font-semibold"
                              : "bg-[#f2eee6] text-[#8a8479] hover:bg-[#e4ded2]"
                          )}
                          title={`Self-Report Habit Index (SRHI) rating ${lvl}/5 (${lvl === 1 ? "Deliberate effort required" : lvl === 5 ? "Fully automatic / effortless" : "Developing rhythm"})`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[9px] text-[#8a8479] italic leading-tight">
                    *Self-Report Habit Index (SRHI): 1 = Deliberate effort, 5 = Perceived automaticity.
                  </p>
                </div>

                {/* 7-Day Completion Heat Dots */}
                <div className="pt-2 border-t border-[#f2eee6] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#8a8479] font-medium">Last 7 Days:</span>
                  <div className="flex items-center gap-1.5">
                    {(habit.recentHistory || [false, false, false, false, false, false, false]).map(
                      (completed, idx) => (
                        <div
                          key={idx}
                          title={completed ? "Completed" : "Not logged"}
                          className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center transition-all",
                            completed
                              ? "bg-[#536b54] text-white"
                              : "bg-[#e8e2d5] text-transparent"
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
        )}
      </div>
    )}

      {/* ========================================================================= */}
      {/* TAB 2: FLOW (Csíkszentmihályi Flow Theory & Persistent Timer) */}
      {/* ========================================================================= */}
      {activeTab === "flow" && (
        <div className="space-y-6 animate-in fade-in-50 duration-150">
          {/* Regain Pattern: Dominant Central Visual — Circular Persistent Focus Timer Dial */}
          <div className="bg-[#fdfcf9] rounded-3xl border border-[#e8e2d5] p-6 sm:p-8 shadow-2xs flex flex-col items-center text-center relative overflow-hidden">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-[#8a8479] mb-1">
              Csíkszentmihályi Immersion Dial
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#201e1b] tracking-tight max-w-md truncate">
              {timerState.taskTitle || "Deep Focus Block"}
            </h2>

            {/* Circular Timer Ring Dial */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center my-3">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-[#ede8dc]"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-[#536b54] transition-all duration-500 ease-out"
                  strokeWidth="5"
                  strokeDasharray={276.4}
                  strokeDashoffset={276.4 * (1 - timerProgress)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Inside Timer Dial */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <span className="font-mono text-4xl sm:text-5xl font-normal text-[#201e1b] tracking-tight">
                  {formatTimer(timerState.secondsLeft)}
                </span>
                <span className="text-[11px] font-sans font-medium text-[#536b54] mt-1 capitalize">
                  {timerState.isRunning
                    ? "In Immersion Flow"
                    : timerState.secondsLeft < timerState.totalMinutes * 60 && timerState.secondsLeft > 0
                    ? "Paused"
                    : "Ready to Focus"}
                </span>
              </div>
            </div>

            {/* Timer Action Controls */}
            <div className="flex items-center gap-2.5 flex-wrap justify-center mt-2">
              <button
                onClick={handleToggleTimer}
                className="px-6 py-3 rounded-full bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] font-semibold text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                {timerState.isRunning ? (
                  <Pause className="w-4 h-4 text-[#e8decb]" />
                ) : (
                  <Play className="w-4 h-4 text-[#e8decb] fill-[#e8decb]" />
                )}
                <span>
                  {timerState.isRunning
                    ? "Pause Interval"
                    : timerState.secondsLeft < timerState.totalMinutes * 60 && timerState.secondsLeft > 0
                    ? "Resume Flow"
                    : "Start Focus Session"}
                </span>
              </button>

              <button
                onClick={() => resetFocusTimer(timerState.totalMinutes)}
                className="p-3 rounded-full bg-[#f2eee6] hover:bg-[#e8e2d5] text-[#201e1b] transition-colors cursor-pointer shadow-2xs"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {(timerState.isRunning ||
                (timerState.secondsLeft < timerState.totalMinutes * 60 && timerState.secondsLeft > 0)) && (
                <button
                  onClick={finishTimerEarly}
                  className="px-4 py-3 rounded-full bg-[#edf2ec] hover:bg-[#d6e0d5] text-[#536b54] text-xs font-semibold transition-colors cursor-pointer border border-[#d6e0d5]"
                >
                  Reflect & Finish
                </button>
              )}
            </div>

            {/* Secondary Controls: Distraction Logger & Presets */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full mt-6 pt-4 border-t border-[#e8e2d5] text-xs">
              <button
                onClick={logTimerInterruption}
                className="px-3.5 py-1.5 rounded-xl bg-[#faece7] hover:bg-[#f3cec3] text-[#b85437] font-medium border border-[#f3cec3] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Log an external or self-interruption"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Log Distraction ({timerState.interruptionsCount})</span>
              </button>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#8a8479] font-medium">Interval:</span>
                {[20, 25, 45, 50, 90].map((dur) => (
                  <button
                    key={dur}
                    onClick={() => resetFocusTimer(dur)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer",
                      timerState.totalMinutes === dur && !timerState.isRunning
                        ? "bg-[#201e1b] text-[#f8f6f0] font-semibold shadow-2xs"
                        : "text-[#545049] hover:bg-[#f2eee6]"
                    )}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Challenge–Skill Check-In Card */}
          <div className="bg-white rounded-3xl border border-[#e8e2d5] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d5]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-[#f2eee6] text-[#201e1b]">
                  <Brain className="w-4 h-4 text-[#536b54]" />
                </span>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-normal text-[#201e1b]">
                    Challenge–Skill Check-In
                  </h3>
                  <p className="text-[11px] text-[#8a8479]">
                    Assess task friction and configure clear conditions before entering focus.
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border",
                  currentQuadrant.color
                )}
              >
                {currentQuadrant.label}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-[#545049] mb-1">Target Task / Subject</label>
                <input
                  type="text"
                  value={timerState.taskTitle}
                  onChange={(e) =>
                    updateTimerChallengeSkill(
                      timerState.perceivedChallenge,
                      timerState.perceivedSkill,
                      timerState.sessionGoal,
                      timerState.completionCriteria,
                      e.target.value,
                      timerState.habitId
                    )
                  }
                  placeholder="e.g. Deep Study Proofs, Architecture Review RFC, Client Proposal..."
                  className="w-full px-3 py-2 bg-[#fdfcf9] border border-[#e8e2d5] rounded-xl text-[#201e1b] text-xs focus:ring-1 focus:ring-[#201e1b] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-[#545049] mb-1">Anchor to Habit (Optional)</label>
                <select
                  value={timerState.habitId || ""}
                  onChange={(e) =>
                    updateTimerChallengeSkill(
                      timerState.perceivedChallenge,
                      timerState.perceivedSkill,
                      timerState.sessionGoal,
                      timerState.completionCriteria,
                      timerState.taskTitle,
                      e.target.value || undefined
                    )
                  }
                  className="w-full px-3 py-2 bg-[#fdfcf9] border border-[#e8e2d5] rounded-xl text-[#201e1b] text-xs focus:ring-1 focus:ring-[#201e1b] focus:outline-hidden"
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
              <div className="p-3 bg-[#fdfcf9] rounded-2xl border border-[#e8e2d5] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#545049]">Perceived Challenge</span>
                  <span className="font-mono font-semibold text-[#201e1b]">
                    {timerState.perceivedChallenge} / 5
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={timerState.perceivedChallenge}
                  onChange={(e) =>
                    updateTimerChallengeSkill(
                      Number(e.target.value),
                      timerState.perceivedSkill,
                      timerState.sessionGoal,
                      timerState.completionCriteria,
                      timerState.taskTitle,
                      timerState.habitId
                    )
                  }
                  className="w-full accent-[#b85437]"
                />
                <div className="flex justify-between text-[10px] text-[#8a8479]">
                  <span>1: Trivial</span>
                  <span>3: Balanced</span>
                  <span>5: Formidable</span>
                </div>
              </div>

              <div className="p-3 bg-[#fdfcf9] rounded-2xl border border-[#e8e2d5] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#545049]">Perceived Skill / Readiness</span>
                  <span className="font-mono font-semibold text-[#201e1b]">
                    {timerState.perceivedSkill} / 5
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={timerState.perceivedSkill}
                  onChange={(e) =>
                    updateTimerChallengeSkill(
                      timerState.perceivedChallenge,
                      Number(e.target.value),
                      timerState.sessionGoal,
                      timerState.completionCriteria,
                      timerState.taskTitle,
                      timerState.habitId
                    )
                  }
                  className="w-full accent-[#536b54]"
                />
                <div className="flex justify-between text-[10px] text-[#8a8479]">
                  <span>1: Novice</span>
                  <span>3: Proficient</span>
                  <span>5: Master</span>
                </div>
              </div>
            </div>

            {/* Adaptive Suggestions based on Challenge-Skill Ratings */}
            <div className="pt-2">
              {timerState.perceivedChallenge >= 4 && timerState.perceivedSkill <= 2 && (
                <div className="p-3.5 rounded-2xl bg-[#faece7] border border-[#f3cec3] text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-[#b85437]">
                    <AlertCircle className="w-4 h-4 text-[#b85437] shrink-0" />
                    <span>Anxiety Risk Detected: Challenge Exceeds Readiness</span>
                  </div>
                  <p className="text-[#8a422d] text-[11px] leading-relaxed">
                    When perceived difficulty is high and confidence is low, procrastination friction peaks.
                    Recommendation: Decompose into an atomic subtask or run a 20-minute activation sprint.
                  </p>
                  <button
                    type="button"
                    onClick={() => resetFocusTimer(20)}
                    className="px-3 py-1.5 rounded-xl bg-[#b85437] hover:bg-[#9c4328] text-white font-medium text-[11px] transition-colors cursor-pointer"
                  >
                    Switch to 20-Minute Activation Sprint
                  </button>
                </div>
              )}

              {timerState.perceivedChallenge <= 2 && timerState.perceivedSkill >= 4 && (
                <div className="p-3.5 rounded-2xl bg-[#faf0e1] border border-[#eedac0] text-xs space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-[#9c631e]">
                    <Sparkles className="w-4 h-4 text-[#9c631e] shrink-0" />
                    <span>Boredom Risk: Task Demand Is Low Relative to Capability</span>
                  </div>
                  <p className="text-[#784c17] text-[11px] leading-relaxed">
                    High readiness with trivial demand leads to wandering attention. Consider introducing tighter time limits or bundling this with an advanced problem to enter the Flow Channel.
                  </p>
                </div>
              )}

              {timerState.perceivedChallenge >= 3 && timerState.perceivedSkill >= 3 && (
                <div className="p-3.5 rounded-2xl bg-[#edf2ec] border border-[#d6e0d5] text-xs space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-[#536b54]">
                    <CheckCircle2 className="w-4 h-4 text-[#536b54] shrink-0" />
                    <span>Optimal Flow Channel: Balanced Challenge & Skill</span>
                  </div>
                  <p className="text-[#3f5240] text-[11px] leading-relaxed">
                    Demands and capability are matched. Put away external notifications, keep phone out of sight, and immerse in the objective.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Past Focus Sessions Stream */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-normal text-[#201e1b]">
              Flow Reflections History ({focusSessions.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {focusSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-white rounded-2xl border border-[#e8e2d5] shadow-2xs text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#201e1b] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#536b54]" />
                      {session.durationMinutes}m {session.taskTitle ? `• ${session.taskTitle}` : "Focus"}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#edf2ec] text-[#536b54] border border-[#d6e0d5]">
                      {session.flowState}
                    </span>
                  </div>

                  {session.reflectionNotes && (
                    <p className="text-[#545049] italic bg-[#f7f5f0] p-2.5 rounded-xl border border-[#e8e2d5]">
                      "{session.reflectionNotes}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-[#8a8479] pt-1 font-mono">
                    <span>
                      {session.absorptionRating ? `Absorption: ${session.absorptionRating}/5` : ""}
                      {session.interruptionsCount !== undefined
                        ? ` • ${session.interruptionsCount} distractions`
                        : ""}
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
        <div className="space-y-6 animate-in fade-in-50 duration-150">
          {/* Scientific Foundation Explainer */}
          <div className="bg-[#fdfcf9] border border-[#e8e2d5] rounded-3xl p-5 sm:p-6 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-[#f2eee6] text-[#201e1b]">
                  <Compass className="w-4 h-4 text-[#536b54]" />
                </span>
                <h3 className="font-serif text-base sm:text-lg font-normal text-[#201e1b]">
                  The Habit Discontinuity Hypothesis
                </h3>
              </div>
              <button
                onClick={() => setIsNewTransitionOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] font-medium text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#e8decb]" />
                <span>New Life Transition</span>
              </button>
            </div>
            <p className="text-[#545049] text-xs leading-relaxed">
              Groundbreaking research by Bas Verplanken and Wendy Wood reveals that everyday habits are sustained by repetitive environmental cues (same bedroom, same transit, same timetable). When a life disruption occurs—such as a <strong>new academic semester</strong>, <strong>new job role</strong>, or <strong>schedule shift</strong>—the old cue triggers disappear. This creates a natural window of heightened neuroplasticity where new productive routines can be adopted without fighting existing inertia.
            </p>
          </div>

          {/* Active Transitions */}
          <div className="space-y-4">
            {habitTransitions.map((trans) => (
              <div
                key={trans.id}
                className="bg-white rounded-3xl border border-[#e8e2d5] p-5 sm:p-6 shadow-2xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-base sm:text-lg font-normal text-[#201e1b]">
                        {trans.title}
                      </h4>
                      <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-[#edf2ec] text-[#536b54] border border-[#d6e0d5]">
                        {trans.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8a8479] mt-0.5">
                      Initiated on {trans.startDate} • Category: {trans.category}
                    </p>
                  </div>
                </div>

                {/* Disrupted Routines & Obsolete Cues */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-[#f7f5f0] rounded-2xl border border-[#e8e2d5] space-y-1">
                    <span className="font-semibold text-[#b85437] block text-[11px]">
                      Disrupted Old Routines:
                    </span>
                    <ul className="list-disc list-inside text-[#545049] space-y-0.5 text-[11px]">
                      {trans.disruptedRoutines.map((dr, i) => (
                        <li key={i}>{dr}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-[#f7f5f0] rounded-2xl border border-[#e8e2d5] space-y-1">
                    <span className="font-semibold text-[#545049] block text-[11px]">
                      Retired Obsolete Cues:
                    </span>
                    <ul className="list-disc list-inside text-[#8a8479] space-y-0.5 text-[11px]">
                      {trans.obsoleteCues.map((oc, i) => (
                        <li key={i}>{oc}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Replacement Anchor Habits */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-semibold text-[#201e1b]">
                    New Anchor Habits Installed:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {trans.targetHabits.map((th, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-2xl bg-[#fdfcf9] border border-[#e8e2d5] text-xs space-y-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#201e1b]">{th.habitName}</span>
                          <span
                            className={cn(
                              "text-[9px] font-semibold px-2 py-0.5 rounded-full border",
                              th.status === "established"
                                ? "bg-[#edf2ec] text-[#536b54] border-[#d6e0d5]"
                                : "bg-[#faf0e1] text-[#9c631e] border-[#eedac0]"
                            )}
                          >
                            {th.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#545049]">
                          <strong>Anchor:</strong> "{th.newAnchorCue}"
                        </p>
                        <p className="text-[10px] text-[#536b54] font-medium">
                          <strong>2-Min Rule:</strong> "{th.minimumVersion}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Behavioral Observation */}
                {trans.aiObservations && (
                  <div className="p-3.5 rounded-2xl bg-[#f2eee6] border border-[#e4ded2] text-xs text-[#201e1b] flex items-start gap-2 shadow-2xs">
                    <Sparkles className="w-4 h-4 text-[#536b54] shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px] sm:text-xs text-[#545049]">
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
        <div className="space-y-6 animate-in fade-in-50 duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-[#e8e2d5] shadow-2xs space-y-1">
              <span className="text-[11px] text-[#8a8479] font-medium uppercase tracking-wider">Deep Work Volume</span>
              <div className="text-2xl font-serif font-normal text-[#201e1b]">
                {focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0)} mins
              </div>
              <p className="text-[10px] text-[#8a8479]">Total recorded focus immersion</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e8e2d5] shadow-2xs space-y-1">
              <span className="text-[11px] text-[#8a8479] font-medium uppercase tracking-wider">Optimal Focus Period</span>
              <div className="text-2xl font-serif font-normal text-[#536b54] capitalize">
                {profile.mostProductivePeriod}
              </div>
              <p className="text-[10px] text-[#8a8479]">Highest self-reported absorption window</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e8e2d5] shadow-2xs space-y-1">
              <span className="text-[11px] text-[#8a8479] font-medium uppercase tracking-wider">Active Life Transitions</span>
              <div className="text-2xl font-serif font-normal text-[#201e1b]">
                {habitTransitions.length} Active
              </div>
              <p className="text-[10px] text-[#8a8479]">Habit discontinuity windows leveraged</p>
            </div>
          </div>

          {/* AI Behavioral Observations */}
          <div className="bg-white rounded-3xl border border-[#e8e2d5] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#536b54]" />
              <h3 className="font-serif text-base sm:text-lg font-normal text-[#201e1b]">
                Behavioral Insights & Adaptive Recommendations
              </h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-[#f7f5f0] border border-[#e8e2d5] space-y-1">
                <span className="font-semibold text-[#201e1b] block">
                  1. Habit Completion & Cue Consistency
                </span>
                {mostConsistentHabit ? (
                  <p className="text-[#545049] text-[11px] sm:text-xs">
                    Your most consistent routine is <strong>{mostConsistentHabit.title}</strong> with{" "}
                    <strong>{mostConsistentHabit.weeklyCompletionRate ?? 86}%</strong> 7-day completion and{" "}
                    <strong>{mostConsistentHabit.cueConsistencyScore ?? 90}%</strong> cue consistency (Self-Reported: {mostConsistentHabit.selfReportedAutomaticity || 4}/5). Continue pairing cognitive targets with physical anchor cues ("{mostConsistentHabit.cue}") to minimize willpower depletion.
                  </p>
                ) : (
                  <p className="text-[#8a8479] text-[11px] sm:text-xs italic">
                    No habits logged yet. Create your first habit in the Habits tab to track completion and cue consistency.
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f7f5f0] border border-[#e8e2d5] space-y-1">
                <span className="font-semibold text-[#201e1b] block">
                  2. Distraction Resistance in Deep Work
                </span>
                {focusSessions.length >= 2 ? (
                  <p className="text-[#545049] text-[11px] sm:text-xs">
                    Empirical session data: Sessions with 0 distractions reported an average of{" "}
                    <strong>{avgZero ?? "4.5"}/5</strong> absorption rating
                    {avgInterrupted ? (
                      <> versus <strong>{avgInterrupted}/5</strong> when interrupted</>
                    ) : null}
                    . Protect your focus blocks during your <strong>{profile.mostProductivePeriod}</strong> window.
                  </p>
                ) : (
                  <p className="text-[#8a8479] text-[11px] sm:text-xs italic">
                    You have recorded {focusSessions.length} session{focusSessions.length === 1 ? "" : "s"}. Complete at least 2 flow reflection sessions to generate empirical distraction resistance metrics.
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f7f5f0] border border-[#e8e2d5] space-y-1">
                <span className="font-semibold text-[#201e1b] block">
                  3. Habit Discontinuity Leveraging
                </span>
                {activeTransition ? (
                  <p className="text-[#545049] text-[11px] sm:text-xs">
                    Your current transition (<strong>{activeTransition.title}</strong>) is in its peak neuroplastic adaptation window. Maintain the 2-minute activation versions daily to anchor neural pathways before environmental patterns solidify.
                  </p>
                ) : (
                  <p className="text-[#8a8479] text-[11px] sm:text-xs italic">
                    No active life transitions recorded. When entering a new academic semester or job role, log a transition in the Habit Reset tab.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: POST-SESSION REFLECTION */}
      {/* ========================================================================= */}
      {showReflectionModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#201e1b]/40 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-[#fbf9f5] rounded-t-3xl sm:rounded-3xl border-t sm:border border-[#e8e2d5] w-full sm:max-w-md p-5 sm:p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="pb-3 border-b border-[#e8e2d5]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#536b54] bg-[#edf2ec] px-2.5 py-0.5 rounded-full border border-[#d6e0d5]">
                Flow Theory Check-In
              </span>
              <h3 className="font-serif text-base sm:text-lg font-normal text-[#201e1b] mt-1">
                How Was Your Immersion State?
              </h3>
              <p className="text-[11px] sm:text-xs text-[#8a8479] mt-0.5">
                Reflecting on challenge vs. skill builds long-term cognitive endurance.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block text-[#545049] font-medium text-xs">Select Flow State:</label>
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
                      "p-2.5 rounded-2xl border text-left transition-all cursor-pointer",
                      flowState === item.id
                        ? "border-[#201e1b] bg-[#201e1b] text-[#f8f6f0] font-semibold shadow-2xs"
                        : "border-[#e8e2d5] bg-white text-[#545049] hover:bg-[#f2eee6]"
                    )}
                  >
                    <div className="font-medium text-xs">{item.label}</div>
                    <div
                      className={cn(
                        "text-[10px] font-normal mt-0.5",
                        flowState === item.id ? "text-[#d5cdbd]" : "text-[#8a8479]"
                      )}
                    >
                      {item.sub}
                    </div>
                  </button>
                ))}
              </div>

              {/* Time Distortion */}
              <div>
                <label className="block text-[#545049] font-medium mb-1">Time Distortion Experience:</label>
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
                        "py-1.5 px-2 rounded-xl border text-center text-[11px] font-medium transition-all cursor-pointer",
                        timeDistortion === td.id
                          ? "bg-[#201e1b] text-[#f8f6f0] border-[#201e1b] font-semibold"
                          : "bg-white text-[#545049] border-[#e8e2d5] hover:bg-[#f2eee6]"
                      )}
                    >
                      {td.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Absorption and Concentration */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[#545049] font-medium mb-1">
                    Absorption ({absorptionRating}/5)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={absorptionRating}
                    onChange={(e) => setAbsorptionRating(Number(e.target.value))}
                    className="w-full accent-[#536b54]"
                  />
                </div>
                <div>
                  <label className="block text-[#545049] font-medium mb-1">
                    Concentration ({concentrationRating}/5)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={concentrationRating}
                    onChange={(e) => setConcentrationRating(Number(e.target.value))}
                    className="w-full accent-[#536b54]"
                  />
                </div>
              </div>

              {/* Reflection Note */}
              <div>
                <label className="block text-[#545049] font-medium mb-1">
                  Reflection Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Cleared 2 difficult proofs. Phone out of reach was decisive..."
                  value={reflectionNotes}
                  onChange={(e) => setReflectionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#e8e2d5] text-[#201e1b] focus:outline-hidden focus:border-[#201e1b] text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8e2d5]">
                <button
                  type="button"
                  onClick={handleDismissReflection}
                  className="px-3.5 py-2 rounded-xl text-[#545049] hover:bg-[#f2eee6] text-xs font-medium cursor-pointer"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleSaveReflection}
                  className="px-4 py-2 rounded-xl bg-[#201e1b] text-[#f8f6f0] font-semibold hover:bg-[#38342f] transition-all shadow-2xs text-xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#201e1b]/40 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-[#fbf9f5] rounded-t-3xl sm:rounded-3xl border-t sm:border border-[#e8e2d5] w-full sm:max-w-md p-5 sm:p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d5]">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#b85437]" />
                <h3 className="font-serif text-base sm:text-lg font-normal text-[#201e1b]">
                  New Science-Backed Habit
                </h3>
              </div>
              <button
                onClick={() => setIsNewHabitOpen(false)}
                className="p-1 rounded-md text-[#8a8479] hover:text-[#201e1b] hover:bg-[#f2eee6] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateHabit}
              autoComplete="off"
              data-form-type="other"
              noValidate
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-medium text-[#545049] mb-1">Habit Behavior</label>
                <input
                  type="text"
                  name="habit_behavior_title"
                  id="habit_behavior_title"
                  required
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  placeholder="e.g. Daily Economics Reading, Evening Plan Review..."
                  autoComplete="off"
                  autoCorrect="off"
                  data-form-type="other"
                  data-lpignore="true"
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d5] rounded-xl text-[#201e1b] focus:border-[#201e1b] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-[#545049] mb-1">Anchor Cue (Existing routine)</label>
                <input
                  type="text"
                  name="habit_anchor_cue"
                  id="habit_anchor_cue"
                  required
                  value={habitCue}
                  onChange={(e) => setHabitCue(e.target.value)}
                  placeholder="e.g. After morning pour-over coffee, Immediately after closing laptop..."
                  autoComplete="off"
                  autoCorrect="off"
                  data-form-type="other"
                  data-lpignore="true"
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d5] rounded-xl text-[#201e1b] focus:border-[#201e1b] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-[#545049] mb-1">Context / Physical Environment</label>
                <input
                  type="text"
                  name="habit_context_env"
                  id="habit_context_env"
                  value={habitContext}
                  onChange={(e) => setHabitContext(e.target.value)}
                  placeholder="e.g. At study desk with noise-canceling headphones..."
                  autoComplete="off"
                  autoCorrect="off"
                  data-form-type="other"
                  data-lpignore="true"
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d5] rounded-xl text-[#201e1b] focus:border-[#201e1b] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-[#545049] mb-1">2-Minute Minimum Version</label>
                <input
                  type="text"
                  name="habit_minimum_version"
                  id="habit_minimum_version"
                  value={habitMinimumVersion}
                  onChange={(e) => setHabitMinimumVersion(e.target.value)}
                  placeholder="e.g. Read 1 problem explanation, Write 1 line of outline..."
                  autoComplete="off"
                  autoCorrect="off"
                  data-form-type="other"
                  data-lpignore="true"
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d5] rounded-xl text-[#201e1b] focus:border-[#201e1b] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#545049] mb-1">Category</label>
                  <select
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#e8e2d5] rounded-xl text-[#201e1b]"
                  >
                    <option value="focus">Focus</option>
                    <option value="learning">Learning</option>
                    <option value="health">Health</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="eco">Eco</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#545049] mb-1">Frequency</label>
                  <select
                    value={habitFrequency}
                    onChange={(e) => setHabitFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#e8e2d5] rounded-xl text-[#201e1b]"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="3x_week">3x per week</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8e2d5]">
                <button
                  type="button"
                  onClick={() => setIsNewHabitOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#545049] hover:bg-[#f2eee6] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#201e1b] text-[#f8f6f0] font-semibold hover:bg-[#38342f] shadow-2xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#201e1b]/40 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-[#fbf9f5] rounded-t-3xl sm:rounded-3xl border-t sm:border border-[#e8e2d5] w-full sm:max-w-md p-5 sm:p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d5]">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#536b54]" />
                <h3 className="font-serif text-base sm:text-lg font-normal text-[#201e1b]">
                  New Life Transition Reset
                </h3>
              </div>
              <button
                onClick={() => setIsNewTransitionOpen(false)}
                className="p-1 rounded-md text-[#8a8479] hover:text-[#201e1b] hover:bg-[#f2eee6] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateTransition}
              autoComplete="off"
              data-form-type="other"
              noValidate
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-medium text-[#545049] mb-1">Transition Title</label>
                <input
                  type="text"
                  name="transition_title"
                  id="transition_title"
                  required
                  value={transTitle}
                  onChange={(e) => setTransTitle(e.target.value)}
                  placeholder="e.g. Fall 2026 Semester, New Senior Eng Role..."
                  autoComplete="off"
                  autoCorrect="off"
                  data-form-type="other"
                  data-lpignore="true"
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d5] rounded-xl text-[#201e1b] focus:border-[#201e1b] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-[#545049] mb-1">Category</label>
                <select
                  value={transCategory}
                  onChange={(e) => setTransCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d5] rounded-xl text-[#201e1b]"
                >
                  <option value="semester">Academic Semester</option>
                  <option value="career">Job / Career Change</option>
                  <option value="relocation">Relocation / Housing</option>
                  <option value="schedule">Schedule / Routine Shift</option>
                  <option value="health">Health / Energy Reset</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#545049] mb-1">
                  Disrupted Routines (comma separated)
                </label>
                <input
                  type="text"
                  value={transDisrupted}
                  onChange={(e) => setTransDisrupted(e.target.value)}
                  placeholder="e.g. Late night library study, 10 AM commute..."
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d5] rounded-xl text-[#201e1b] focus:border-[#201e1b] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-[#545049] mb-1">
                  Obsolete Cues to Retire (comma separated)
                </label>
                <input
                  type="text"
                  value={transObsolete}
                  onChange={(e) => setTransObsolete(e.target.value)}
                  placeholder="e.g. Previous dorm desk, old meeting reminders..."
                  className="w-full px-3 py-2 bg-white border border-[#e8e2d5] rounded-xl text-[#201e1b] focus:border-[#201e1b] focus:outline-hidden"
                />
              </div>

              <div className="pt-2 border-t border-[#e8e2d5] space-y-2">
                <span className="font-semibold text-[#201e1b] block text-xs">
                  New Anchor Habit to Install:
                </span>
                <div>
                  <label className="block text-[11px] text-[#545049] mb-0.5">Habit Name</label>
                  <input
                    type="text"
                    value={transHabitName}
                    onChange={(e) => setTransHabitName(e.target.value)}
                    placeholder="e.g. Morning 20m Deep Problem Solving"
                    className="w-full px-3 py-1.5 bg-white border border-[#e8e2d5] rounded-xl text-[#201e1b]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#545049] mb-0.5">Anchor Cue</label>
                    <input
                      type="text"
                      value={transAnchorCue}
                      onChange={(e) => setTransAnchorCue(e.target.value)}
                      placeholder="e.g. After breakfast"
                      className="w-full px-3 py-1.5 bg-white border border-[#e8e2d5] rounded-xl text-[#201e1b]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#545049] mb-0.5">2-Min Rule</label>
                    <input
                      type="text"
                      value={transMinVersion}
                      onChange={(e) => setTransMinVersion(e.target.value)}
                      placeholder="e.g. Read 1 page"
                      className="w-full px-3 py-1.5 bg-white border border-[#e8e2d5] rounded-xl text-[#201e1b]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8e2d5]">
                <button
                  type="button"
                  onClick={() => setIsNewTransitionOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#545049] hover:bg-[#f2eee6] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#201e1b] text-[#f8f6f0] font-semibold hover:bg-[#38342f] shadow-2xs cursor-pointer"
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
        <div className="p-8 text-center text-xs text-[#8a8479]">
          Loading Growth Workspace...
        </div>
      }
    >
      <GrowthContent />
    </Suspense>
  );
}
